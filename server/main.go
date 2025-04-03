package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Sherlock Hums - Server")
	})
	fmt.Println("Backend running on port 8080")
	http.ListenAndServe(":8080", nil)
}
