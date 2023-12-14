package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

const TOKEN_EXPIRY = 12 * time.Hour

func HandleAuth(p *WebUIPlugin) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		if req.Header.Get("Content-type") != "application/json" {
			http.Error(res, "Content-Type header is not application/json", http.StatusUnsupportedMediaType)
			return
		}

		var request AuthRequest

		decoder := json.NewDecoder(req.Body)
		decoder.DisallowUnknownFields()
		err := decoder.Decode(&request)
		if err != nil {
			http.Error(res, fmt.Sprintf("invalid request body - %s", err), http.StatusBadRequest)
			return
		}

		if request.Username != p.AdminUsername || request.Password != p.AdminPassword {
			http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		accessToken, expires, err := GenerateToken(p)
		if err != nil {
			http.Error(res, fmt.Sprintf("error generating access token - %s", err), http.StatusInternalServerError)
			return
		}

		res.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(res).Encode(AuthResponse{
			Username:    request.Username,
			AccessToken: accessToken,
			Expires:     expires,
		})
		if err != nil {
			http.Error(res, fmt.Sprintf("error encoding response - %s", err), http.StatusInternalServerError)
			return
		}
	}
}

func BasicAuthProvider(p *WebUIPlugin, handler http.Handler) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		if username, password, ok := req.BasicAuth(); ok {
			if username != p.AdminUsername || password != p.AdminPassword {
				http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}

			token, expires, err := GenerateToken(p)
			if err != nil {
				http.Error(res, fmt.Sprintf("error creating access token - %s", err), http.StatusInternalServerError)
				return
			}

			http.SetCookie(res, &http.Cookie{
				Name:  "accessToken",
				Value: token,

				Path:    "/",
				Expires: expires,
			})
		}

		handler.ServeHTTP(res, req)
	}
}

func AuthValidator(p *WebUIPlugin, handler http.Handler) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {
		token := req.Header.Get("Authorization")
		if !strings.HasPrefix(token, "Bearer ") {
			http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		ok, err := ValidateToken(p, strings.TrimSpace(strings.TrimPrefix(token, "Bearer ")))
		if !ok || err != nil {
			http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		handler.ServeHTTP(res, req)
	}
}

var TOKEN_CHARSET = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

const TOKEN_LENGTH = 64

func GenerateTokenSecret() string {
	rand.Seed(time.Now().UnixNano())

	result := make([]rune, TOKEN_LENGTH)
	for i := range result {
		result[i] = TOKEN_CHARSET[rand.Intn(len(TOKEN_CHARSET))]
	}

	return string(result)
}

func GenerateToken(p *WebUIPlugin) (token string, expires time.Time, err error) {
	expires = time.Now().Add(TOKEN_EXPIRY)

	jwt := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expires),
	})

	token, err = jwt.SignedString([]byte(p.JWTSecret))
	return
}

func ValidateToken(p *WebUIPlugin, token string) (bool, error) {
	parsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(p.JWTSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	if err != nil {
		return false, err
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	return ok && parsed.Valid && claims.VerifyExpiresAt(time.Now().Unix(), true), nil
}
