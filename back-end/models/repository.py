from sqlalchemy import create_engine, Column, Integer, String
from storage.storage import Base

# Define the Repository model
class Repository(Base):
    __tablename__ = 'repositories'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    local_path = Column(String)
    url_path = Column(String)

    # Adding __str__ method for string representation
    def __str__(self):
        return f"Repository(id={self.id}, name='{self.name}', local_path='{self.local_path}', url_path='{self.url_path}')"

    def to_dict(self):
        dict_rep = {
            "id": self.id,
            "name": self.name,
            "local_path": self.local_path,
            "url_path": self.url_path
        }
        
        return dict_rep