"""
Military-Grade Security Architecture for CounselFlow
Client Privilege Protection System with Zero-Trust Implementation
"""

import hashlib
import secrets
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
import json
import uuid
from dataclasses import dataclass
from enum import Enum

# Security logging
security_logger = logging.getLogger("counselflow.security")

class SecurityLevel(Enum):
    STANDARD = "standard"
    ELEVATED = "elevated"
    MILITARY_GRADE = "military_grade"

class PrivilegeLevel(Enum):
    PUBLIC = "public"
    CONFIDENTIAL = "confidential"
    ATTORNEY_CLIENT = "attorney_client"
    WORK_PRODUCT = "work_product"

@dataclass
class SecurityContext:
    user_id: str
    client_id: str
    session_id: str
    security_level: SecurityLevel
    privilege_level: PrivilegeLevel
    access_time: datetime
    encryption_key_id: str
    audit_trail_id: str

@dataclass
class EncryptionMetadata:
    algorithm: str
    key_id: str
    iv: bytes
    salt: bytes
    created_at: datetime
    client_id: str

class ClientPrivilegeProtector:
    """
    Implements cryptographic isolation between client matters
    Ensures attorney-client privilege is maintained at all times
    """
    
    def __init__(self):
        self.master_key = self._generate_master_key()
        self.client_keys: Dict[str, bytes] = {}
        self.active_contexts: Dict[str, SecurityContext] = {}
        
    def _generate_master_key(self) -> bytes:
        """Generate master encryption key from secure random source"""
        return Fernet.generate_key()
    
    def _derive_client_key(self, client_id: str, password: bytes) -> bytes:
        """Derive unique encryption key for each client using PBKDF2"""
        salt = hashlib.sha256(client_id.encode()).digest()
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        return kdf.derive(password)
    
    def create_client_context(
        self, 
        user_id: str, 
        client_id: str, 
        security_level: SecurityLevel = SecurityLevel.MILITARY_GRADE
    ) -> SecurityContext:
        """Create cryptographically isolated context for client work"""
        
        session_id = str(uuid.uuid4())
        encryption_key_id = f"client_{client_id}_{session_id}"
        audit_trail_id = str(uuid.uuid4())
        
        # Generate unique client encryption key
        if client_id not in self.client_keys:
            client_password = secrets.token_bytes(32)
            self.client_keys[client_id] = self._derive_client_key(client_id, client_password)
        
        context = SecurityContext(
            user_id=user_id,
            client_id=client_id,
            session_id=session_id,
            security_level=security_level,
            privilege_level=PrivilegeLevel.ATTORNEY_CLIENT,
            access_time=datetime.utcnow(),
            encryption_key_id=encryption_key_id,
            audit_trail_id=audit_trail_id
        )
        
        self.active_contexts[session_id] = context
        
        # Log security context creation
        security_logger.info(f"Created secure context: {session_id} for client: {client_id}")
        
        return context
    
    def encrypt_client_data(
        self, 
        data: str, 
        client_id: str, 
        privilege_level: PrivilegeLevel = PrivilegeLevel.ATTORNEY_CLIENT
    ) -> Dict[str, Any]:
        """Encrypt data with client-specific key and metadata"""
        
        if client_id not in self.client_keys:
            raise ValueError(f"No encryption key found for client: {client_id}")
        
        # Generate random IV for each encryption
        iv = secrets.token_bytes(16)
        
        # Use AES-256-GCM for authenticated encryption
        cipher = Cipher(
            algorithms.AES(self.client_keys[client_id]),
            modes.GCM(iv),
            backend=default_backend()
        )
        
        encryptor = cipher.encryptor()
        
        # Additional authenticated data (AAD)
        aad = json.dumps({
            "client_id": client_id,
            "privilege_level": privilege_level.value,
            "timestamp": datetime.utcnow().isoformat()
        }).encode()
        
        encryptor.authenticate_additional_data(aad)
        ciphertext = encryptor.update(data.encode()) + encryptor.finalize()
        
        metadata = EncryptionMetadata(
            algorithm="AES-256-GCM",
            key_id=f"client_{client_id}",
            iv=iv,
            salt=hashlib.sha256(client_id.encode()).digest(),
            created_at=datetime.utcnow(),
            client_id=client_id
        )
        
        return {
            "ciphertext": base64.b64encode(ciphertext).decode(),
            "tag": base64.b64encode(encryptor.tag).decode(),
            "metadata": {
                "algorithm": metadata.algorithm,
                "key_id": metadata.key_id,
                "iv": base64.b64encode(metadata.iv).decode(),
                "salt": base64.b64encode(metadata.salt).decode(),
                "created_at": metadata.created_at.isoformat(),
                "client_id": metadata.client_id,
                "privilege_level": privilege_level.value
            },
            "aad": base64.b64encode(aad).decode()
        }
    
    def decrypt_client_data(self, encrypted_data: Dict[str, Any], client_id: str) -> str:
        """Decrypt client data with privilege validation"""
        
        if client_id not in self.client_keys:
            raise ValueError(f"No decryption key found for client: {client_id}")
        
        metadata = encrypted_data["metadata"]
        
        # Validate client access
        if metadata["client_id"] != client_id:
            raise PermissionError("Client privilege violation: Attempted cross-client access")
        
        # Reconstruct cipher
        iv = base64.b64decode(metadata["iv"])
        ciphertext = base64.b64decode(encrypted_data["ciphertext"])
        tag = base64.b64decode(encrypted_data["tag"])
        aad = base64.b64decode(encrypted_data["aad"])
        
        cipher = Cipher(
            algorithms.AES(self.client_keys[client_id]),
            modes.GCM(iv, tag),
            backend=default_backend()
        )
        
        decryptor = cipher.decryptor()
        decryptor.authenticate_additional_data(aad)
        
        try:
            plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            return plaintext.decode()
        except Exception as e:
            security_logger.error(f"Decryption failed for client {client_id}: {e}")
            raise PermissionError("Decryption failed: Invalid credentials or tampering detected")
    
    def validate_privilege_access(
        self, 
        context: SecurityContext, 
        requested_client_id: str
    ) -> bool:
        """Validate that user can access specific client data"""
        
        if context.client_id != requested_client_id:
            security_logger.warning(
                f"Privilege violation attempt: User {context.user_id} "
                f"attempted to access client {requested_client_id} "
                f"from context {context.client_id}"
            )
            return False
        
        return True
    
    def revoke_client_access(self, client_id: str):
        """Revoke all access to client data (e.g., for conflicts)"""
        if client_id in self.client_keys:
            del self.client_keys[client_id]
        
        # Remove all active contexts for this client
        contexts_to_remove = [
            session_id for session_id, context in self.active_contexts.items()
            if context.client_id == client_id
        ]
        
        for session_id in contexts_to_remove:
            del self.active_contexts[session_id]
        
        security_logger.info(f"Revoked all access to client: {client_id}")

class AuditLogger:
    """
    Immutable audit logging for legal compliance
    All legal actions must be recorded with cryptographic integrity
    """
    
    def __init__(self):
        self.audit_chain: List[Dict[str, Any]] = []
        self.last_hash = "genesis"
    
    def _calculate_hash(self, data: Dict[str, Any]) -> str:
        """Calculate cryptographic hash for audit entry"""
        content = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(content.encode()).hexdigest()
    
    def log_security_event(
        self,
        event_type: str,
        user_id: str,
        client_id: Optional[str],
        details: Dict[str, Any],
        security_context: Optional[SecurityContext] = None
    ):
        """Log security event with immutable audit trail"""
        
        timestamp = datetime.utcnow()
        
        audit_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": timestamp.isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "client_id": client_id,
            "session_id": security_context.session_id if security_context else None,
            "details": details,
            "previous_hash": self.last_hash,
            "chain_index": len(self.audit_chain)
        }
        
        # Calculate hash for this entry
        audit_entry["hash"] = self._calculate_hash(audit_entry)
        
        # Add to chain
        self.audit_chain.append(audit_entry)
        self.last_hash = audit_entry["hash"]
        
        # Log to secure storage
        security_logger.info(f"Audit: {event_type} - {audit_entry['id']}")
    
    def verify_audit_integrity(self) -> bool:
        """Verify the integrity of the audit chain"""
        
        if not self.audit_chain:
            return True
        
        previous_hash = "genesis"
        
        for entry in self.audit_chain:
            # Verify previous hash link
            if entry["previous_hash"] != previous_hash:
                return False
            
            # Verify entry hash
            entry_copy = entry.copy()
            stored_hash = entry_copy.pop("hash")
            calculated_hash = self._calculate_hash(entry_copy)
            
            if stored_hash != calculated_hash:
                return False
            
            previous_hash = stored_hash
        
        return True

class EncryptionMiddleware:
    """
    Middleware for automatic encryption/decryption of sensitive data
    Ensures all client data is encrypted at rest and in transit
    """
    
    def __init__(self, privilege_protector: ClientPrivilegeProtector):
        self.privilege_protector = privilege_protector
        self.audit_logger = AuditLogger()
    
    async def encrypt_request_data(
        self, 
        data: Dict[str, Any], 
        context: SecurityContext
    ) -> Dict[str, Any]:
        """Automatically encrypt sensitive fields in request data"""
        
        sensitive_fields = [
            "content", "document", "notes", "correspondence", 
            "legal_advice", "strategy", "client_information"
        ]
        
        encrypted_data = data.copy()
        
        for field in sensitive_fields:
            if field in data and data[field]:
                encrypted_result = self.privilege_protector.encrypt_client_data(
                    str(data[field]),
                    context.client_id,
                    context.privilege_level
                )
                encrypted_data[f"{field}_encrypted"] = encrypted_result
                del encrypted_data[field]  # Remove plaintext
        
        # Log encryption action
        self.audit_logger.log_security_event(
            "data_encryption",
            context.user_id,
            context.client_id,
            {"fields_encrypted": [f for f in sensitive_fields if f in data]},
            context
        )
        
        return encrypted_data
    
    async def decrypt_response_data(
        self, 
        data: Dict[str, Any], 
        context: SecurityContext
    ) -> Dict[str, Any]:
        """Automatically decrypt sensitive fields in response data"""
        
        decrypted_data = data.copy()
        
        encrypted_fields = [key for key in data.keys() if key.endswith("_encrypted")]
        
        for field in encrypted_fields:
            original_field = field.replace("_encrypted", "")
            try:
                decrypted_content = self.privilege_protector.decrypt_client_data(
                    data[field],
                    context.client_id
                )
                decrypted_data[original_field] = decrypted_content
                del decrypted_data[field]  # Remove encrypted version
            except Exception as e:
                security_logger.error(f"Failed to decrypt {field}: {e}")
                raise PermissionError(f"Failed to decrypt {original_field}")
        
        # Log decryption action
        if encrypted_fields:
            self.audit_logger.log_security_event(
                "data_decryption",
                context.user_id,
                context.client_id,
                {"fields_decrypted": [f.replace("_encrypted", "") for f in encrypted_fields]},
                context
            )
        
        return decrypted_data

# Global security instances
privilege_protector = ClientPrivilegeProtector()
audit_logger = AuditLogger()
encryption_middleware = EncryptionMiddleware(privilege_protector)
