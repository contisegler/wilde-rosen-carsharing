from google.cloud import firestore
 

class FirestoreBaseUtil:
    def __init__(self, project_id: str):
        """
        Initialize with a Firestore client.
        Args:
            project_id (str): ID of the project containing the Firestore database.
        """
        self.db = firestore.Client(project=project_id)

    def list_documents_in_collection(self, collection_path: str) -> list[str]:
        """
        List all document paths in a given collection.
        Args:
            collection_path (str): Path to the collection (e.g., 'users')
        Returns:
            list[str]: List of document paths (e.g., ['users/user1', 'users/user2'])
        """
        collection_ref = self.db.collection(collection_path)
        docs = collection_ref.stream()
        doc_paths = [f"{collection_path}/{doc.id}" for doc in docs]
        print(f"Found {len(doc_paths)} documents in {collection_path}")
        return doc_paths

    def get_doc(self, doc_path: str) -> dict | None:
        doc_ref = self.db.document(doc_path)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            return None

    def set_doc(self, doc_path: str, data: dict):
        doc_ref = self.db.document(doc_path)
        doc_ref.set(data)


class FirestoreCopyUtil(FirestoreBaseUtil):
    def __init__(self, source_project_id: str, dest_project_id: str):
        """
        Initialize Firestore clients for source and destination projects.
        """
        self.source_db = firestore.Client(project=source_project_id)
        self.dest_db = firestore.Client(project=dest_project_id)
        super().__init__(source_project_id)

    def copy_documents(self, doc_paths: list[str]):
        """
        Copy specific documents from source to destination Firestore.
        Args:
            doc_paths (List[str]): List of document paths (e.g., 'collection/doc_id') to copy.
        """
        for doc_path in doc_paths:
            doc_ref = self.source_db.document(doc_path)
            doc = doc_ref.get()
            if doc.exists:
                dest_ref = self.dest_db.document(doc_path)
                dest_ref.set(doc.to_dict())
                print(f"Copied {doc_path}")
            else:
                print(f"Document not found: {doc_path}")

    def verify_documents(self, doc_paths: list[str]):
        """
        Verify if the documents exist in the destination Firestore.
        Args:
            doc_paths (list[str]): List of document paths to verify.
        """
        for doc_path in doc_paths:
            dest_ref = self.dest_db.document(doc_path)
            doc = dest_ref.get()
            if doc.exists:
                print(f"Verified: {doc_path}")
            else:
                print(f"Missing in destination: {doc_path}")


class FirestoreDocumentValidator(FirestoreBaseUtil):
    def __init__(self, project_id: str):
        """
        Initialize with a Firestore client (typically destination db).
        Args:
            project_id (str): ID of the project containing the Firestore database.
        """
        super().__init__(project_id=project_id)

    def guess_schema_from_doc(self, doc_path: str) -> dict:
        """
        Guess the schema (field names and types) from an example document.
        Args:
            doc_path (str): Path to the example document (e.g., 'collection/doc_id').
        Returns:
            dict: Mapping of field names to Python types, e.g. {"name": str, "age": int}
        """
        doc_ref = self.db.document(doc_path)
        doc = doc_ref.get()
        if not doc.exists:
            print(f"Document not found: {doc_path}")
            return {}
        data = doc.to_dict()
        schema = {k: type(v) for k, v in data.items()}
        print(f"Guessed schema for {doc_path}: {schema}")
        return schema

    def verify_document_fields(self, doc_paths: list[str], required_fields: dict):
        """
        Verify that all documents have the required fields with the correct type.
        Args:
            doc_paths (list[str]): List of document paths to check.
            required_fields (dict): Dict of field name to type, e.g. {"name": str, "age": int}
        """
        for doc_path in doc_paths:
            dest_ref = self.db.document(doc_path)
            doc = dest_ref.get()
            if not doc.exists:
                print(f"Missing in destination: {doc_path}")
                continue
            data = doc.to_dict()
            missing_fields = []
            wrong_type_fields = []
            for field, field_type in required_fields.items():
                if field not in data:
                    missing_fields.append(field)
                elif not isinstance(data[field], field_type):
                    wrong_type_fields.append((field, type(data[field]), field_type))
            if missing_fields or wrong_type_fields:
                print(f"Issues in {doc_path}:")
                if missing_fields:
                    print(f"  Missing fields: {missing_fields}")
                if wrong_type_fields:
                    print("  Fields with wrong type:")
                    for field, actual, expected in wrong_type_fields:
                        print(f"    {field}: got {actual}, expected {expected}")
            else:
                print(f"All required fields valid in {doc_path}")

