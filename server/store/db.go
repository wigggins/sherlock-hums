package store

import (
	"database/sql"

	_ "github.com/lib/pq"
)

var db *sql.DB

func InitDB(databaseURL string) error {
	var err error
	db, err = sql.Open("postgres", databaseURL)
	if err != nil {
		return err
	}
	return db.Ping()
}

func CloseDB() {
	if db != nil {
		db.Close()
	}
}
