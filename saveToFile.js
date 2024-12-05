import fstat from "fs";
import path from 'path';


export const saveToFile = (filePath, data) =>{
    try{
        const absolutPath = path.resolve(filePath);

        fstat.writeFileSync(absolutPath, JSON.stringify(data, null ,2));
    }catch(error){
        throw new Error('Nie udało się zapisać danych do pliku.');
    }
};

export default saveToFile;