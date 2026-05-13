import api from '@/services/api';
export const livestockService = {
    getAnimalTypes: () => api.get('/livestock/animal-types/'),
    getAnimalType: (id) => api.get(`/livestock/animal-types/${id}/`),
    listAnimals: () => api.get('/livestock/animals/'),
    createAnimal: (data) => api.post('/livestock/animals/', data),
    getAnimal: (id) => api.get(`/livestock/animals/${id}/`),
    updateAnimal: (id, data) => api.patch(`/livestock/animals/${id}/`, data),
    deleteAnimal: (id) => api.delete(`/livestock/animals/${id}/`),
    listActiveAnimals: () => api.get('/livestock/animals/active/'),
    listPregnantAnimals: () => api.get('/livestock/animals/pregnant/'),
    listAnimalsByType: (typeId) => api.get(`/livestock/animals/type/${typeId}/`),
    // Breeding Records
    listBreedingRecords: (animalId) => animalId ? api.get(`/livestock/animals/${animalId}/breeding-records/`) : api.get('/livestock/breeding-records/'),
    addBreedingRecord: (animalId, data) => api.post(`/livestock/animals/${animalId}/breeding-records/`, data),
    getBreedingRecord: (id) => api.get(`/livestock/breeding-records/${id}/`),
    updateBreedingRecord: (id, data) => api.patch(`/livestock/breeding-records/${id}/`, data),
    deleteBreedingRecord: (id) => api.delete(`/livestock/breeding-records/${id}/`),
    // Health Records
    listHealthRecords: (animalId) => animalId ? api.get(`/livestock/animals/${animalId}/health-records/`) : api.get('/livestock/health-records/'),
    addHealthRecord: (animalId, data) => api.post(`/livestock/animals/${animalId}/health-records/`, data),
    getHealthRecord: (id) => api.get(`/livestock/health-records/${id}/`),
    updateHealthRecord: (id, data) => api.patch(`/livestock/health-records/${id}/`, data),
    deleteHealthRecord: (id) => api.delete(`/livestock/health-records/${id}/`),
    // Milk Records
    listMilkRecords: (animalId) => animalId ? api.get(`/livestock/animals/${animalId}/milk-records/`) : api.get('/livestock/milk-records/'),
    addMilkRecord: (animalId, data) => api.post(`/livestock/animals/${animalId}/milk-records/`, data),
    getMilkRecord: (id) => api.get(`/livestock/milk-records/${id}/`),
    updateMilkRecord: (id, data) => api.patch(`/livestock/milk-records/${id}/`, data),
    deleteMilkRecord: (id) => api.delete(`/livestock/milk-records/${id}/`),
    // Vaccinations
    listVaccinations: (animalId) => animalId ? api.get(`/livestock/animals/${animalId}/vaccinations/`) : api.get('/livestock/vaccinations/'),
    addVaccination: (animalId, data) => api.post(`/livestock/animals/${animalId}/vaccinations/`, data),
    getVaccination: (id) => api.get(`/livestock/vaccinations/${id}/`),
    updateVaccination: (id, data) => api.patch(`/livestock/vaccinations/${id}/`, data),
    deleteVaccination: (id) => api.delete(`/livestock/vaccinations/${id}/`),
    // Incomes
    listIncomes: (animalId) => animalId ? api.get(`/livestock/animals/${animalId}/incomes/`) : api.get('/livestock/incomes/'),
    addIncome: (animalId, data) => api.post(`/livestock/animals/${animalId}/incomes/`, data),
    getIncome: (id) => api.get(`/livestock/incomes/${id}/`),
    updateIncome: (id, data) => api.patch(`/livestock/incomes/${id}/`, data),
    deleteIncome: (id) => api.delete(`/livestock/incomes/${id}/`),
    // Expenses
    listExpenses: (animalId) => animalId ? api.get(`/livestock/animals/${animalId}/expenses/`) : api.get('/livestock/expenses/'),
    addExpense: (animalId, data) => api.post(`/livestock/animals/${animalId}/expenses/`, data),
    getExpense: (id) => api.get(`/livestock/expenses/${id}/`),
    updateExpense: (id, data) => api.patch(`/livestock/expenses/${id}/`, data),
    deleteExpense: (id) => api.delete(`/livestock/expenses/${id}/`),
};
export default livestockService;
