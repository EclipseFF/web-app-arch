package internal

import (
	"io"
	"mime/multipart"
	"os"
	"path"
)

type FileStorage struct {
	BaseDir *string
}

func (f *FileStorage) SaveFile(file *multipart.FileHeader, rest *Restaurant, fileName *string) (*string, error) {
	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()

	if _, err := os.Stat(*f.BaseDir + *rest.UUID); os.IsNotExist(err) {
		err = os.MkdirAll(*f.BaseDir+*rest.UUID, os.ModeDir)
		if err != nil {
			return nil, err
		}
	}

	dst, err := os.Create(*f.BaseDir + *rest.UUID + "/" + *fileName + path.Ext(file.Filename))
	if err != nil {
		return nil, err
	}
	defer dst.Close()

	// Copy
	if _, err = io.Copy(dst, src); err != nil {
		os.Remove(dst.Name())
		return nil, err
	}
	*fileName = *fileName + path.Ext(file.Filename)
	return fileName, nil
}

func (f *FileStorage) DeleteFile(rest *Restaurant, fileName *string) error {
	return os.Remove(*f.BaseDir + *rest.UUID + "/" + *fileName)
}

func (f *FileStorage) DeleteRestaurantFolder(rest *Restaurant) (*string, error) {
	return f.BaseDir, os.RemoveAll(*f.BaseDir + *rest.UUID)
}
