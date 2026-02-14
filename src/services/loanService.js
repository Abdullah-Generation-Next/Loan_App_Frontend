// src/services/loanService.js
import api from './api';

// Submit Loan Application
export const submitLoanApplication = async (loanData) => {
  try {
    const response = await api.post('/loans/apply', {
      fullName: loanData.fullName,
      mobileNumber: loanData.mobileNumber,
      email: loanData.email,
      loanAmount: loanData.loanAmount,
      loanDurationMonths: loanData.loanDurationMonths,
      loanPurpose: loanData.loanPurpose,
      employmentType: loanData.employmentType,
      monthlyIncome:loanData.monthlyIncome
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Loan application submission failed' };
  }
};

// Get User's Loan Applications
export const getUserLoans = async () => {
  try {
    const response = await api.get('/loans/my-loans');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch loan applications' };
  }
};

// Get Single Loan Details
export const getLoanDetails = async (loanId) => {
  try {
    const response = await api.get(`/loans/${loanId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch loan details' };
  }
};
