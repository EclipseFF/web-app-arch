package lib

import "math/rand"

const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func GenerateRandomString() string {
	temp := make([]byte, 10)
	for i := range temp {
		temp[i] = CHARSET[rand.Intn(len(CHARSET))]
	}

	return string(temp)
}
