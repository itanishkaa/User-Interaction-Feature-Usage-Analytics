from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    subject = decode_access_token(credentials.credentials)
    if subject is None:
        raise credentials_exception

    user = db.get(User, int(subject))
    if user is None or not user.is_active:
        raise credentials_exception

    return user

def get_dataset_or_404(db: Session, dataset_id: int, current_user: User) -> Dataset:
    """Shared ownership-check logic, usable whether dataset_id comes from a
    path param (see get_owned_dataset below) or a request body (AI routes)."""
    dataset = db.get(Dataset, dataset_id)
    if dataset is None or dataset.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found"
        )
    return dataset

def get_owned_dataset(
        dataset_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
) -> Dataset:
    """Fetches a dataset, 404ing if it doesn't exist or isn't owned by the caller."""
    dataset = db.get(Dataset, dataset_id)
    if dataset is None or dataset.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found"
        )
    return dataset