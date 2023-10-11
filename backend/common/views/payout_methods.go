package views

import "github.com/stripe/stripe-go/v75"

type PayoutMethodType string

const (
	PayoutMethodTypeBankAccount PayoutMethodType = "bank_account"
	PayoutMethodTypeCard        PayoutMethodType = "card"
)

type PayoutMethod struct {
	Type PayoutMethodType `json:"type"`

	BankAccount BankAccountPayoutMethod `json:"bank_account,omitempty"`
	Card        CardPayoutMethod        `json:"card,omitempty"`
}

type BankAccountPayoutMethod struct {
	BankName    string `json:"bank_name,omitempty"`
	AccountType string `json:"account_type,omitempty"`
	Last4       string `json:"last4,omitempty"`
	Currency    string `json:"currency,omitempty"`
}

type CardPayoutMethod struct {
	Brand    string `json:"brand,omitempty"`
	Last4    string `json:"last4,omitempty"`
	Currency string `json:"currency,omitempty"`
}

func ConvertPayoutMethods(externalAccounts []*stripe.AccountExternalAccount) []PayoutMethod {
	payoutMethods := make([]PayoutMethod, len(externalAccounts))
	for i, externalAccount := range externalAccounts {
		payoutMethods[i] = PayoutMethod{
			Type: PayoutMethodType(externalAccount.Type),
		}

		if externalAccount.Type == stripe.AccountExternalAccountTypeBankAccount {
			payoutMethods[i].BankAccount = BankAccountPayoutMethod{
				BankName:    externalAccount.BankAccount.BankName,
				AccountType: externalAccount.BankAccount.AccountType,
				Last4:       externalAccount.BankAccount.Last4,
				Currency:    string(externalAccount.BankAccount.Currency),
			}
		}

		if externalAccount.Type == stripe.AccountExternalAccountTypeCard {
			payoutMethods[i].Card = CardPayoutMethod{
				Brand:    string(externalAccount.Card.Brand),
				Last4:    externalAccount.Card.Last4,
				Currency: string(externalAccount.Card.Currency),
			}
		}
	}
	return payoutMethods
}
