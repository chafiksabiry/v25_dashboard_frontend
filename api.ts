const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://38.242.208.242:5011/api';

// Reps
export const getReps = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reps`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getReps:', error);
    throw error;
  }
};

// Gigs
export const getGigs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/gigs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getGigs:', error);
    throw error;
  }
};

// Matches
export const findMatchesForGig = async (gigId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/gig/${gigId}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error finding matches for gig:', error);
    throw error;
  }
};

export const findGigsForRep = async (repId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/rep/${repId}/gigs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error finding gigs for rep:', error);
    throw error;
  }
};

export const generateOptimalMatches = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating optimal matches:', error);
    throw error;
  }
};

// CRUD operations for matches
export const getAllMatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting all matches:', error);
    throw error;
  }
};

export const createMatch = async (matchData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

export const updateMatch = async (id, matchData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
};

export const deleteMatch = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
}; 