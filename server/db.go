package main

import (
	"database/sql"

	_ "github.com/lib/pq"
)

func initDB(databaseURL string) error {
	var err error
	db, err = sql.Open("postgres", databaseURL)
	if err != nil {
		return err
	}
	// Optionally, verify connection with db.Ping()
	return db.Ping()
}

func closeDB() {
	if db != nil {
		db.Close()
	}
}
