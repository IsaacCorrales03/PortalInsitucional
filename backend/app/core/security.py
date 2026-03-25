# app/core/security.py

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
from dotenv import load_dotenv
import os
import hashlib
from typing import Final, Any, Dict

from app.db.models import User

load_dotenv()

try:
    SECRET_KEY: Final[str] = os.environ["SECRET_KEY"]
    ALGORITHM: Final[str] = os.environ["ALGORITHM"]
    ACCESS_TOKEN_EXPIRE_MINUTES: Final[int] = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
except KeyError as e:
    raise ValueError(f"Falta variable de entorno: {e.args[0]}")
except ValueError:
    raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES debe ser un entero")


def _prehash(password: str) -> bytes:
    """SHA-256 prehash → siempre 64 chars, nunca supera el límite de 72 bytes de bcrypt."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_prehash(plain), hashed.encode("utf-8"))


def create_access_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise ValueError("Token inválido o expirado")
    
@dataclass
class AuthenticatedUser:
    """User con roles ya resueltos, retornado por get_current_user."""
    id: int
    email: str
    full_name: str
    national_id: str
    birth_date: datetime.date | None # type: ignore
    phone: str | None
    is_active: bool
    created_at: datetime 
    roles: list[str] = field(default_factory=list)