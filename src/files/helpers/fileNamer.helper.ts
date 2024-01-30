import { v4 as uuid } from 'uuid';
export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, fileName: string) => void, //creamos un callback especificando la data, aunque puede ser de tipo Function
) => {
  if (!file) return callback(new Error('File is empty'), '');

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;
  callback(null, fileName); //si no hay error enviamos el nuevo nombre
};
