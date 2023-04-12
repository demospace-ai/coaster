// Code generated by MockGen. DO NOT EDIT.
// Source: common/query/query.go

// Package mock_query is a generated GoMock package.
package mock_query

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	data "go.fabra.io/server/common/data"
	models "go.fabra.io/server/common/models"
	query "go.fabra.io/server/common/query"
)

// MockQueryService is a mock of QueryService interface.
type MockQueryService struct {
	ctrl     *gomock.Controller
	recorder *MockQueryServiceMockRecorder
}

// MockQueryServiceMockRecorder is the mock recorder for MockQueryService.
type MockQueryServiceMockRecorder struct {
	mock *MockQueryService
}

// NewMockQueryService creates a new mock instance.
func NewMockQueryService(ctrl *gomock.Controller) *MockQueryService {
	mock := &MockQueryService{ctrl: ctrl}
	mock.recorder = &MockQueryServiceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockQueryService) EXPECT() *MockQueryServiceMockRecorder {
	return m.recorder
}

// GetClient mocks base method.
func (m *MockQueryService) GetClient(ctx context.Context, connection *models.Connection) (query.ConnectorClient, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetClient", ctx, connection)
	ret0, _ := ret[0].(query.ConnectorClient)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetClient indicates an expected call of GetClient.
func (mr *MockQueryServiceMockRecorder) GetClient(ctx, connection interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetClient", reflect.TypeOf((*MockQueryService)(nil).GetClient), ctx, connection)
}

// GetFieldValues mocks base method.
func (m *MockQueryService) GetFieldValues(ctx context.Context, connection *models.Connection, namespace, tableName, fieldName string) ([]any, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetFieldValues", ctx, connection, namespace, tableName, fieldName)
	ret0, _ := ret[0].([]any)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetFieldValues indicates an expected call of GetFieldValues.
func (mr *MockQueryServiceMockRecorder) GetFieldValues(ctx, connection, namespace, tableName, fieldName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetFieldValues", reflect.TypeOf((*MockQueryService)(nil).GetFieldValues), ctx, connection, namespace, tableName, fieldName)
}

// GetNamespaces mocks base method.
func (m *MockQueryService) GetNamespaces(ctx context.Context, connection *models.Connection) ([]string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetNamespaces", ctx, connection)
	ret0, _ := ret[0].([]string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetNamespaces indicates an expected call of GetNamespaces.
func (mr *MockQueryServiceMockRecorder) GetNamespaces(ctx, connection interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetNamespaces", reflect.TypeOf((*MockQueryService)(nil).GetNamespaces), ctx, connection)
}

// GetQueryIterator mocks base method.
func (m *MockQueryService) GetQueryIterator(ctx context.Context, connection *models.Connection, queryString string) (data.RowIterator, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetQueryIterator", ctx, connection, queryString)
	ret0, _ := ret[0].(data.RowIterator)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetQueryIterator indicates an expected call of GetQueryIterator.
func (mr *MockQueryServiceMockRecorder) GetQueryIterator(ctx, connection, queryString interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetQueryIterator", reflect.TypeOf((*MockQueryService)(nil).GetQueryIterator), ctx, connection, queryString)
}

// GetSchema mocks base method.
func (m *MockQueryService) GetSchema(ctx context.Context, connection *models.Connection, namespace, tableName string) ([]data.Field, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSchema", ctx, connection, namespace, tableName)
	ret0, _ := ret[0].([]data.Field)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSchema indicates an expected call of GetSchema.
func (mr *MockQueryServiceMockRecorder) GetSchema(ctx, connection, namespace, tableName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSchema", reflect.TypeOf((*MockQueryService)(nil).GetSchema), ctx, connection, namespace, tableName)
}

// GetTables mocks base method.
func (m *MockQueryService) GetTables(ctx context.Context, connection *models.Connection, namespace string) ([]string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetTables", ctx, connection, namespace)
	ret0, _ := ret[0].([]string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetTables indicates an expected call of GetTables.
func (mr *MockQueryServiceMockRecorder) GetTables(ctx, connection, namespace interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetTables", reflect.TypeOf((*MockQueryService)(nil).GetTables), ctx, connection, namespace)
}

// GetWarehouseClient mocks base method.
func (m *MockQueryService) GetWarehouseClient(ctx context.Context, connection *models.Connection) (query.WarehouseClient, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetWarehouseClient", ctx, connection)
	ret0, _ := ret[0].(query.WarehouseClient)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetWarehouseClient indicates an expected call of GetWarehouseClient.
func (mr *MockQueryServiceMockRecorder) GetWarehouseClient(ctx, connection interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetWarehouseClient", reflect.TypeOf((*MockQueryService)(nil).GetWarehouseClient), ctx, connection)
}

// RunQuery mocks base method.
func (m *MockQueryService) RunQuery(ctx context.Context, connection *models.Connection, queryString string) (*data.QueryResults, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RunQuery", ctx, connection, queryString)
	ret0, _ := ret[0].(*data.QueryResults)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// RunQuery indicates an expected call of RunQuery.
func (mr *MockQueryServiceMockRecorder) RunQuery(ctx, connection, queryString interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RunQuery", reflect.TypeOf((*MockQueryService)(nil).RunQuery), ctx, connection, queryString)
}

// MockConnectorClient is a mock of ConnectorClient interface.
type MockConnectorClient struct {
	ctrl     *gomock.Controller
	recorder *MockConnectorClientMockRecorder
}

// MockConnectorClientMockRecorder is the mock recorder for MockConnectorClient.
type MockConnectorClientMockRecorder struct {
	mock *MockConnectorClient
}

// NewMockConnectorClient creates a new mock instance.
func NewMockConnectorClient(ctrl *gomock.Controller) *MockConnectorClient {
	mock := &MockConnectorClient{ctrl: ctrl}
	mock.recorder = &MockConnectorClientMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockConnectorClient) EXPECT() *MockConnectorClientMockRecorder {
	return m.recorder
}

// GetFieldValues mocks base method.
func (m *MockConnectorClient) GetFieldValues(ctx context.Context, namespace, tableName, fieldName string) ([]any, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetFieldValues", ctx, namespace, tableName, fieldName)
	ret0, _ := ret[0].([]any)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetFieldValues indicates an expected call of GetFieldValues.
func (mr *MockConnectorClientMockRecorder) GetFieldValues(ctx, namespace, tableName, fieldName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetFieldValues", reflect.TypeOf((*MockConnectorClient)(nil).GetFieldValues), ctx, namespace, tableName, fieldName)
}

// GetNamespaces mocks base method.
func (m *MockConnectorClient) GetNamespaces(ctx context.Context) ([]string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetNamespaces", ctx)
	ret0, _ := ret[0].([]string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetNamespaces indicates an expected call of GetNamespaces.
func (mr *MockConnectorClientMockRecorder) GetNamespaces(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetNamespaces", reflect.TypeOf((*MockConnectorClient)(nil).GetNamespaces), ctx)
}

// GetQueryIterator mocks base method.
func (m *MockConnectorClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetQueryIterator", ctx, queryString)
	ret0, _ := ret[0].(data.RowIterator)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetQueryIterator indicates an expected call of GetQueryIterator.
func (mr *MockConnectorClientMockRecorder) GetQueryIterator(ctx, queryString interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetQueryIterator", reflect.TypeOf((*MockConnectorClient)(nil).GetQueryIterator), ctx, queryString)
}

// GetSchema mocks base method.
func (m *MockConnectorClient) GetSchema(ctx context.Context, namespace, tableName string) (data.Schema, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSchema", ctx, namespace, tableName)
	ret0, _ := ret[0].(data.Schema)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSchema indicates an expected call of GetSchema.
func (mr *MockConnectorClientMockRecorder) GetSchema(ctx, namespace, tableName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSchema", reflect.TypeOf((*MockConnectorClient)(nil).GetSchema), ctx, namespace, tableName)
}

// GetTables mocks base method.
func (m *MockConnectorClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetTables", ctx, namespace)
	ret0, _ := ret[0].([]string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetTables indicates an expected call of GetTables.
func (mr *MockConnectorClientMockRecorder) GetTables(ctx, namespace interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetTables", reflect.TypeOf((*MockConnectorClient)(nil).GetTables), ctx, namespace)
}

// RunQuery mocks base method.
func (m *MockConnectorClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	m.ctrl.T.Helper()
	varargs := []interface{}{ctx, queryString}
	for _, a := range args {
		varargs = append(varargs, a)
	}
	ret := m.ctrl.Call(m, "RunQuery", varargs...)
	ret0, _ := ret[0].(*data.QueryResults)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// RunQuery indicates an expected call of RunQuery.
func (mr *MockConnectorClientMockRecorder) RunQuery(ctx, queryString interface{}, args ...interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	varargs := append([]interface{}{ctx, queryString}, args...)
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RunQuery", reflect.TypeOf((*MockConnectorClient)(nil).RunQuery), varargs...)
}

// MockWarehouseClient is a mock of WarehouseClient interface.
type MockWarehouseClient struct {
	ctrl     *gomock.Controller
	recorder *MockWarehouseClientMockRecorder
}

// MockWarehouseClientMockRecorder is the mock recorder for MockWarehouseClient.
type MockWarehouseClientMockRecorder struct {
	mock *MockWarehouseClient
}

// NewMockWarehouseClient creates a new mock instance.
func NewMockWarehouseClient(ctrl *gomock.Controller) *MockWarehouseClient {
	mock := &MockWarehouseClient{ctrl: ctrl}
	mock.recorder = &MockWarehouseClientMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockWarehouseClient) EXPECT() *MockWarehouseClientMockRecorder {
	return m.recorder
}

// CleanUpStagingData mocks base method.
func (m *MockWarehouseClient) CleanUpStagingData(ctx context.Context, stagingOptions query.StagingOptions) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CleanUpStagingData", ctx, stagingOptions)
	ret0, _ := ret[0].(error)
	return ret0
}

// CleanUpStagingData indicates an expected call of CleanUpStagingData.
func (mr *MockWarehouseClientMockRecorder) CleanUpStagingData(ctx, stagingOptions interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CleanUpStagingData", reflect.TypeOf((*MockWarehouseClient)(nil).CleanUpStagingData), ctx, stagingOptions)
}

// GetFieldValues mocks base method.
func (m *MockWarehouseClient) GetFieldValues(ctx context.Context, namespace, tableName, fieldName string) ([]any, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetFieldValues", ctx, namespace, tableName, fieldName)
	ret0, _ := ret[0].([]any)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetFieldValues indicates an expected call of GetFieldValues.
func (mr *MockWarehouseClientMockRecorder) GetFieldValues(ctx, namespace, tableName, fieldName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetFieldValues", reflect.TypeOf((*MockWarehouseClient)(nil).GetFieldValues), ctx, namespace, tableName, fieldName)
}

// GetNamespaces mocks base method.
func (m *MockWarehouseClient) GetNamespaces(ctx context.Context) ([]string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetNamespaces", ctx)
	ret0, _ := ret[0].([]string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetNamespaces indicates an expected call of GetNamespaces.
func (mr *MockWarehouseClientMockRecorder) GetNamespaces(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetNamespaces", reflect.TypeOf((*MockWarehouseClient)(nil).GetNamespaces), ctx)
}

// GetQueryIterator mocks base method.
func (m *MockWarehouseClient) GetQueryIterator(ctx context.Context, queryString string) (data.RowIterator, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetQueryIterator", ctx, queryString)
	ret0, _ := ret[0].(data.RowIterator)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetQueryIterator indicates an expected call of GetQueryIterator.
func (mr *MockWarehouseClientMockRecorder) GetQueryIterator(ctx, queryString interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetQueryIterator", reflect.TypeOf((*MockWarehouseClient)(nil).GetQueryIterator), ctx, queryString)
}

// GetSchema mocks base method.
func (m *MockWarehouseClient) GetSchema(ctx context.Context, namespace, tableName string) (data.Schema, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSchema", ctx, namespace, tableName)
	ret0, _ := ret[0].(data.Schema)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSchema indicates an expected call of GetSchema.
func (mr *MockWarehouseClientMockRecorder) GetSchema(ctx, namespace, tableName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSchema", reflect.TypeOf((*MockWarehouseClient)(nil).GetSchema), ctx, namespace, tableName)
}

// GetTables mocks base method.
func (m *MockWarehouseClient) GetTables(ctx context.Context, namespace string) ([]string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetTables", ctx, namespace)
	ret0, _ := ret[0].([]string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetTables indicates an expected call of GetTables.
func (mr *MockWarehouseClientMockRecorder) GetTables(ctx, namespace interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetTables", reflect.TypeOf((*MockWarehouseClient)(nil).GetTables), ctx, namespace)
}

// LoadFromStaging mocks base method.
func (m *MockWarehouseClient) LoadFromStaging(ctx context.Context, namespace, tableName string, loadOptions query.LoadOptions) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "LoadFromStaging", ctx, namespace, tableName, loadOptions)
	ret0, _ := ret[0].(error)
	return ret0
}

// LoadFromStaging indicates an expected call of LoadFromStaging.
func (mr *MockWarehouseClientMockRecorder) LoadFromStaging(ctx, namespace, tableName, loadOptions interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "LoadFromStaging", reflect.TypeOf((*MockWarehouseClient)(nil).LoadFromStaging), ctx, namespace, tableName, loadOptions)
}

// RunQuery mocks base method.
func (m *MockWarehouseClient) RunQuery(ctx context.Context, queryString string, args ...any) (*data.QueryResults, error) {
	m.ctrl.T.Helper()
	varargs := []interface{}{ctx, queryString}
	for _, a := range args {
		varargs = append(varargs, a)
	}
	ret := m.ctrl.Call(m, "RunQuery", varargs...)
	ret0, _ := ret[0].(*data.QueryResults)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// RunQuery indicates an expected call of RunQuery.
func (mr *MockWarehouseClientMockRecorder) RunQuery(ctx, queryString interface{}, args ...interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	varargs := append([]interface{}{ctx, queryString}, args...)
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RunQuery", reflect.TypeOf((*MockWarehouseClient)(nil).RunQuery), varargs...)
}

// StageData mocks base method.
func (m *MockWarehouseClient) StageData(ctx context.Context, csvData string, stagingOptions query.StagingOptions) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StageData", ctx, csvData, stagingOptions)
	ret0, _ := ret[0].(error)
	return ret0
}

// StageData indicates an expected call of StageData.
func (mr *MockWarehouseClientMockRecorder) StageData(ctx, csvData, stagingOptions interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "StageData", reflect.TypeOf((*MockWarehouseClient)(nil).StageData), ctx, csvData, stagingOptions)
}
