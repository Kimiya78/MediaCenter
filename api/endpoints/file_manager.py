from datetime import datetime

@self.router.post("/create_url")
async def upsert_url_item(  
    request: Request,
    file_guid : str = Body(... , alias= "FileGUID"),
    expires_on_date : str  = Body(None , alias= "ExpiresOnDate"), 
    password_clear: str = Body(None , alias="PasswordHash"),
    is_anonymous: bool = Body(None , alias="IsAnonymous"),
    inactive: bool = Body(None , alias="Inactive"),
    auth_data = Depends(authenticate_user)
):
    print(" ---------- Received expires_on_date:" ,  type(expires_on_date) , '-----------------')
    
    # Convert string to datetime if not None
    if expires_on_date:
        try:
            expires_on_date = datetime.strptime(expires_on_date, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return Response(content="Invalid date format. Expected format: YYYY-MM-DD HH:MM:SS", status_code=400)
    
    attachment_url_guid = str(uuid.uuid4())
    user_id = 2534
    mode = 'c'
    if password_clear == '':
        password_clear= None
    
    result = self.file_manager_repo.attachment_url( 
        file_guid=file_guid,
        attachment_url_guid=attachment_url_guid,
        expires_on_date=expires_on_date,
        password_clear=password_clear,
        is_anonymous=is_anonymous,
        user_id=user_id, 
        inactive=inactive,
        mode=mode 
    ) 