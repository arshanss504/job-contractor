from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt import decode_access_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload


def require_agent(user=Depends(get_current_user)):
    if user["role"] != "AGENT":
        raise HTTPException(status_code=403, detail="Agent access required")
    return user


def require_contractor(user=Depends(get_current_user)):
    if user["role"] != "CONTRACTOR":
        raise HTTPException(status_code=403, detail="Contractor access required")
    return user
