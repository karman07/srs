from fastapi import APIRouter, HTTPException, status, Depends
from app.contact.models import ContactRequest, ContactResponse, ContactMessage
from app.contact.service import ContactService
from app.auth.guards import require_user_or_admin, require_admin
from app.users.models import User
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/", response_model=ContactResponse)
async def submit_contact_form(
    contact_request: ContactRequest
):
    """Submit contact form (no authentication required)"""
    try:
        contact_service = ContactService()
        
        contact_message = await contact_service.create_contact_message(
            contact_request.dict(),
            None
        )
        
        return ContactResponse(
            message="Contact form submitted successfully. We'll get back to you soon!",
            contact_id=contact_message.id
        )
        
    except Exception as e:
        logger.error(f"Contact form submission error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact form"
        )

@router.get("/admin/messages", response_model=List[ContactMessage])
async def get_contact_messages(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(require_admin)
):
    """Get all contact messages (Admin only)"""
    try:
        contact_service = ContactService()
        messages = await contact_service.get_all_contacts(skip, limit)
        return messages
        
    except Exception as e:
        logger.error(f"Get contact messages error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contact messages"
        )

@router.put("/admin/messages/{contact_id}/status")
async def update_contact_status(
    contact_id: str,
    status: str,
    admin_user: User = Depends(require_admin)
):
    """Update contact message status (Admin only)"""
    try:
        if status not in ["pending", "replied", "closed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be 'pending', 'replied', or 'closed'"
            )
        
        contact_service = ContactService()
        success = await contact_service.update_contact_status(contact_id, status)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact message not found"
            )
        
        return {"message": f"Contact status updated to {status}", "contact_id": contact_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update contact status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update contact status"
        )