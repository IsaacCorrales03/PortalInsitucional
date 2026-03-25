from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import (
    Specialty,
    Course,
    Section,
    Applicant,
    StudentProfile,
)
from app.api.deps import get_current_user, check_permission
from app.db.models import User

router = APIRouter(prefix="/specialties", tags=["specialties"])


# =======================
#       SCHEMAS
# =======================

class SpecialtyCreateSchema(BaseModel):
    name: str
    description: str | None = None


class SpecialtyUpdateSchema(BaseModel):
    name: str | None = None
    description: str | None = None


# =======================
#   PUBLIC ENDPOINTS
# =======================

@router.get("/public")
def list_specialties_public(db: Session = Depends(get_db)):
    specialties = db.query(Specialty).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "description": s.description
        }
        for s in specialties
    ]


@router.get("/public/{specialty_id}")
def get_specialty_public(specialty_id: int, db: Session = Depends(get_db)):
    specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if not specialty:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    return {
        "id": specialty.id,
        "name": specialty.name,
        "description": specialty.description
    }


# =======================
#   ADMIN ENDPOINTS
# =======================

@router.get("/")
def list_specialties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_permission(current_user, "manage_specialties", db)

    specialties = db.query(Specialty).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "description": s.description
        }
        for s in specialties
    ]


@router.get("/{specialty_id}")
def get_specialty(
    specialty_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_permission(current_user, "manage_specialties", db)

    specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if not specialty:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    return {
        "id": specialty.id,
        "name": specialty.name,
        "description": specialty.description
    }


@router.post("/")
def create_specialty(
    data: SpecialtyCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_permission(current_user, "manage_specialties", db)

    existing = db.query(Specialty).filter(Specialty.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="La especialidad ya existe")

    specialty = Specialty(
        name=data.name,
        description=data.description
    )

    db.add(specialty)
    db.commit()
    db.refresh(specialty)

    return {
        "id": specialty.id,
        "name": specialty.name,
        "description": specialty.description
    }


@router.put("/{specialty_id}")
def update_specialty(
    specialty_id: int,
    data: SpecialtyUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_permission(current_user, "manage_specialties", db)

    specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if not specialty:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    if data.name is not None:
        existing = db.query(Specialty).filter(
            Specialty.name == data.name,
            Specialty.id != specialty_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Nombre ya en uso")
        specialty.name = data.name

    if data.description is not None:
        specialty.description = data.description

    db.commit()
    db.refresh(specialty)

    return {
        "id": specialty.id,
        "name": specialty.name,
        "description": specialty.description
    }


@router.delete("/{specialty_id}")
def delete_specialty(
    specialty_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_permission(current_user, "manage_specialties", db)

    specialty = db.query(Specialty).filter(Specialty.id == specialty_id).first()
    if not specialty:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    # Validaciones de uso (integridad)
    in_use = (
        db.query(Course).filter(Course.specialty_id == specialty_id).first()
        or db.query(Section).join(Course).filter(Course.specialty_id == specialty_id).first()
        or db.query(Applicant).filter(
            (Applicant.primary_specialty_id == specialty_id) |
            (Applicant.secondary_specialty_id == specialty_id) |
            (Applicant.assigned_specialty_id == specialty_id)
        ).first()
        or db.query(StudentProfile).filter(StudentProfile.specialty_id == specialty_id).first()
    )

    if in_use:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la especialidad porque está en uso"
        )

    db.delete(specialty)
    db.commit()

    return {"detail": f"Especialidad '{specialty.name}' eliminada"}