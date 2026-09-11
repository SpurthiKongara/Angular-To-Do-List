from database import engine

try:
    with engine.connect() as connection:
        print("PostgreSQL connection successful!")
except Exception as e:
    print("Connection failed:")
    print(e)