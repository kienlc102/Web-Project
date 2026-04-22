from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Catalog(Base):
    __tablename__ = "catalog"

    id = Column(Integer, primary_key=True, index=True)
    product_type = Column(String(255), nullable=False)
