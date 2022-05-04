package handlers

import (
	"encoding/json"
	"net/http"
)

type SlackEventRequest struct {
	Challenge string `json:"challenge"`
}

type SlackEventResponse struct {
	Challenge string `json:"challenge"`
}

func SlackEvent(env Env, w http.ResponseWriter, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	var slackEventRequest SlackEventRequest
	err := decoder.Decode(&slackEventRequest)
	if err != nil {
		return err
	}

	// TODO: don't just return the raw post
	return json.NewEncoder(w).Encode()
}
