package api

import (
	"encoding/json"
	"fabra/internal/auth"
	dashboard_repository "fabra/internal/dashboards"
	"fabra/internal/errors"
	"fabra/internal/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type GetAllDashboardsRequest struct {
	Page *int `json:"page,omitempty"`
}

type GetAllDashboardsResponse struct {
	Dashboards []models.Dashboard `json:"dashboards"`
}

func (s ApiService) GetAllDashboards(auth auth.Authentication, w http.ResponseWriter, r *http.Request) error {

	page := 0
	vars := mux.Vars(r)
	pageParam, ok := vars["page"]
	if ok {
		pageInt, err := strconv.Atoi(pageParam)
		if err != nil {
			return errors.BadRequest
		}

		page = pageInt
	}

	dashboards, err := dashboard_repository.LoadAllDashboards(s.db, page, auth.Organization.ID)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(GetAllDashboardsResponse{
		Dashboards: dashboards,
	})
}
