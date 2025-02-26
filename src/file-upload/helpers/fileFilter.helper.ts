export const fileFilter = (req: Express.Request, file: Express.Multer.File, callBack: Function ) => {
    
    if( !file ) return callBack( new Error('File is empty!'), false );

    const allowedExtensions = /\/(jpg|jpeg|png|gif)$/;
    if( !allowedExtensions.exec(file.mimetype) ) return callBack( new Error('Solo se permiten imágenes y archivos PDF'), false);

    callBack(null, true);
}