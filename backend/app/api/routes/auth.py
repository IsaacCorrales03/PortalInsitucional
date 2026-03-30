from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Role, UserRole
from app.schemas.user import *
from app.schemas.auth import *
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    # Obtener roles del usuario
    role_names = [
        r.name
        for r in db.query(Role)
            .join(UserRole, Role.id == UserRole.role_id)
            .filter(UserRole.user_id == user.id)
            .all()
    ]

    token = create_access_token({
        "sub": str(user.id),
        "roles": role_names  # agregamos roles
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.put("/change-password")
def change_password(data: ChangePasswordSchema, db: Session = Depends(get_db)):
    # Obtener el usuario
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar contraseña actual
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")

    # Validar que las nuevas contraseñas coincidan
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")

    # Actualizar la contraseña
    user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"detail": "Contraseña actualizada exitosamente"}