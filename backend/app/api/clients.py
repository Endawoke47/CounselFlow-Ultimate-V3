from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..core.database import get_db
from ..core.deps import get_current_user, get_staff_or_admin_user
from ..models.user import User
from ..models.client import Client
from ..schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate, ClientList

router = APIRouter()

@router.get("/", response_model=ClientList)
def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of clients with pagination and search"""
    query = db.query(Client)
    
    if search:
        search_filter = or_(
            Client.first_name.ilike(f"%{search}%"),
            Client.last_name.ilike(f"%{search}%"),
            Client.email.ilike(f"%{search}%"),
            Client.company_name.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    total = query.count()
    clients = query.offset(skip).limit(limit).all()
    
    return ClientList(
        clients=clients,
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )

@router.get("/{client_id}", response_model=ClientSchema)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific client by ID"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client

@router.post("/", response_model=ClientSchema, status_code=status.HTTP_201_CREATED)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_or_admin_user)
):
    """Create a new client"""
    # Check if email already exists
    existing_client = db.query(Client).filter(Client.email == client_data.email).first()
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client with this email already exists"
        )
    
    db_client = Client(**client_data.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    return db_client

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_or_admin_user)
):
    """Update a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check email uniqueness if email is being updated
    if client_data.email and client_data.email != client.email:
        existing_client = db.query(Client).filter(
            Client.email == client_data.email,
            Client.id != client_id
        ).first()
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists for another client"
            )
    
    # Update fields
    update_data = client_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    
    return client

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_or_admin_user)
):
    """Delete a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check if client has active matters
    from ..models.matter import Matter
    active_matters = db.query(Matter).filter(
        Matter.client_id == client_id,
        Matter.status != "closed"
    ).count()
    
    if active_matters > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete client with active matters"
        )
    
    db.delete(client)
    db.commit()
    
    return {"message": "Client deleted successfully"}