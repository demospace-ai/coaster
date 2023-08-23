package input

type UserUpdates struct {
	FirstName *string `json:"first_name" validate:"required,min=2,max=100"`
	LastName  *string `json:"last_name" validate:"required,min=2,max=100"`
	About     *string `json:"about"`
	Password  *string `json:"password"`
}
