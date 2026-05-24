from typing import Dict, List, Optional, Any
from google.cloud import firestore


class AccountManager:
    def __init__(self) -> None:
        self.db: firestore.Client = firestore.Client()
        self.accounts: Dict[str, Dict[str, Any]] = {}
        self.load_accounts()
    
    def load_accounts(self) -> None:
        """Load all accounts from Firestore into memory."""
        accounts_stream = self.db.collection('accounts').stream()
        self.accounts = {}
        for account in accounts_stream:
            account_data = account.to_dict()
            self.accounts[account.id] = account_data
    
    def search_accounts(self, search_strings: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Search for accounts by name or email.
        
        Args:
            search_strings: List of strings to search for (case-insensitive)
            
        Returns:
            Dictionary of matching accounts {account_id: account_data}
        """
        results: Dict[str, Dict[str, Any]] = {}
        for search_string in search_strings:
            for account_id, account_data in self.accounts.items():
                if search_string.lower() in account_data.get('name', '').lower():
                    results[account_id] = account_data
                    continue
                for email in account_data.get('emails', []):
                    if search_string.lower() in email.lower():
                        results[account_id] = account_data
                        break
        return results
    
    def merge_accounts(self, primary_account_id: str, secondary_account_id: str, name: Optional[str] = None) -> Dict[str, Any]:
        """
        Merge two accounts. The primary account keeps its ID, the secondary account ID is added to merged_account_ids.
        All emails from both accounts are combined.
        
        Args:
            primary_account_id: The account ID to keep
            secondary_account_id: The account ID to merge into primary (will be deleted)
            name: Optional name to set on the merged account
            
        Returns:
            Updated account data
        """
        if primary_account_id not in self.accounts or secondary_account_id not in self.accounts:
            raise ValueError("Both account IDs must exist")
        
        primary_data = self.accounts[primary_account_id]
        secondary_data = self.accounts[secondary_account_id]
        
        merged_emails = list(set(primary_data.get('emails', []) + secondary_data.get('emails', [])))
        
        merged_account_ids = primary_data.get('merged_account_ids', [])
        merged_account_ids.append(secondary_account_id)
        merged_account_ids.extend(secondary_data.get('merged_account_ids', []))
        merged_account_ids = list(set(merged_account_ids))
        
        updated_data = {
            'emails': merged_emails,
            'merged_account_ids': merged_account_ids
        }
        
        if name:
            updated_data['name'] = name
        elif 'name' in primary_data:
            updated_data['name'] = primary_data['name']
        elif 'name' in secondary_data:
            updated_data['name'] = secondary_data['name']
        
        self.db.collection('accounts').document(primary_account_id).set(updated_data)
        self.db.collection('accounts').document(secondary_account_id).delete()
        
        self.load_accounts()
        
        return {primary_account_id: self.accounts[primary_account_id]}
