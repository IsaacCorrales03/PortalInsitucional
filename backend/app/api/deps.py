from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.security import SECRET_KEY, ALGORITHM, AuthenticatedUser
from app.db.session import get_db
from app.db.models import User, Role, UserRole, RolePermission, Permission

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    """
    Extrae el usuario del token JWT y realiza validaciones:
    - Token válido y no expirado
    - Usuario existe en DB
    - Usuario activo
    - Roles opcionales añadidos dinámicamente a user.roles
    """

    try:
        # Decodificar token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

        user_id = int(user_id_str)

        # Consultar usuario en DB
        user: User | None = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no existe")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

        # Obtener roles desde la relación user_roles → roles
        role_names: List[str] = [
            role.name
            for role in db.query(Role)
            .join(UserRole, Role.id == UserRole.role_id)
            .filter(UserRole.user_id == user.id)
            .all()
        ]

        # Añadir roles dinámicamente al objeto user
        return AuthenticatedUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            national_id=user.national_id,
            birth_date=user.birth_date,
            phone=user.phone,
            is_active=user.is_active,
            created_at=user.created_at,
            roles=role_names,
        )

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")


def require_roles(*allowed_roles: str):
    """
    Dependencia para rutas protegidas por roles.
    Ejemplo:
        @router.get("/admin")
        def dashboard(user: User = Depends(require_roles("admin"))):
            ...
    """
    def wrapper(user: User = Depends(get_current_user)) -> User:
        user_roles: List[str] = getattr(user, "roles", [])
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los roles: {allowed_roles}"
            )
        return user
    return wrapper

def admin_required(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # obtener roles del usuario
    role_names = [
        r.name for r in db.query(Role)
                        .join(UserRole, Role.id == UserRole.role_id)
                        .filter(UserRole.user_id == current_user.id)
                        .all()
    ]
    if "super_admin" not in role_names and "admin" not in role_names:
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user




def check_permission(user: AuthenticatedUser, permission_code: str, db: Session):
    # Obtener roles del usuario
    role_ids = [ur.role_id for ur in db.query(UserRole).filter(UserRole.user_id == user.id)]
    if not role_ids:
        raise HTTPException(status_code=403, detail="Usuario sin roles asignados")

    # Verificar si alguno de los roles tiene el permiso
    perms = [
    code for (code,) in db.query(Permission.code)
                            .join(RolePermission, Permission.id == RolePermission.permission_id)
                            .filter(RolePermission.role_id.in_(role_ids))
                            .all()
    ]
    if permission_code not in perms:
        raise HTTPException(status_code=403, detail=f"No tiene permiso {permission_code}")