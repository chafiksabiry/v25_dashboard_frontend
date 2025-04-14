const getLeads = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided"
      });
    }

    // Handle both Zoho-oauthtoken and Bearer formats
    const accessToken = authHeader.startsWith('Zoho-oauthtoken ') 
      ? authHeader.split('Zoho-oauthtoken ')[1]
      : authHeader.split('Bearer ')[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header format"
      });
    }

    console.log('Attempting to fetch leads with token:', accessToken.substring(0, 10) + '...');

    // Try different Zoho API endpoint formats
    const endpoints = [
      'https://www.zohoapis.com/crm/v2/Leads',
      'https://www.zohoapis.com/crm/v2/leads',
      'https://www.zohoapis.com/crm/v2/Leads?page=1&per_page=200'
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.data || !response.data.data) {
          console.log('No data in response:', response.data);
          continue;
        }

        return res.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        lastError = error;
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All Zoho API endpoints failed');

  } catch (error) {
    console.error('Final error fetching leads:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
        error: error.response?.data?.message || "Authentication failed"
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Zoho CRM API endpoint not found",
        error: error.response?.data?.message || "API endpoint not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des leads",
      error: error.response?.data?.message || error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }
};

const configureZohoCRM = async (req, res) => {
  try {
    const { clientId, clientSecret, refreshToken } = req.body;

    // Validation des champs requis
    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis (clientId, clientSecret, refreshToken)"
      });
    }

    // Log pour déboguer
    console.log('Received configuration:', {
      clientId,
      clientSecret: '***hidden***',
      refreshToken: '***hidden***'
    });

    // Function to wait for a specified time
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Retry logic for rate limiting
    const maxRetries = 3;
    const baseDelay = 5000; // 5 seconds
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Vérifier la validité des informations en essayant d'obtenir un access token
        const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
          params: {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token'
          }
        });

        console.log('Zoho token response:', {
          status: tokenResponse.status,
          hasAccessToken: !!tokenResponse.data.access_token
        });

        if (!tokenResponse.data.access_token) {
          throw new Error('No access token received from Zoho');
        }

        // Sauvegarder dans la base de données
        const config = new ZohoConfig({
          clientId,
          clientSecret,
          refreshToken,
          lastUpdated: new Date()
        });

        await config.save();

        return res.json({
          success: true,
          message: "Configuration Zoho CRM mise à jour avec succès",
          accessToken: tokenResponse.data.access_token
        });

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Check if it's a rate limit error
        if (error.response?.data?.error === 'Access Denied' && 
            error.response?.data?.error_description?.includes('too many requests')) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`Rate limited. Waiting ${delay}ms before retry...`);
            await wait(delay);
            continue;
          }
        }

        // For other errors, break the retry loop
        break;
      }
    }

    // If we get here, all attempts failed
    throw lastError || new Error('Failed to configure Zoho CRM');

  } catch (error) {
    console.error('Error configuring Zoho:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la configuration de Zoho CRM",
      error: error.response?.data || error.message,
      isRateLimited: error.response?.data?.error === 'Access Denied' && 
                    error.response?.data?.error_description?.includes('too many requests')
    });
  }
};

const getDeals = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided"
      });
    }

    // Handle both Zoho-oauthtoken and Bearer formats
    const accessToken = authHeader.startsWith('Zoho-oauthtoken ') 
      ? authHeader.split('Zoho-oauthtoken ')[1]
      : authHeader.split('Bearer ')[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header format"
      });
    }

    console.log('Attempting to fetch deals with token:', accessToken.substring(0, 10) + '...');

    // Try different Zoho API endpoint formats
    const endpoints = [
      'https://www.zohoapis.com/crm/v2/Deals',
      'https://www.zohoapis.com/crm/v2/deals',
      'https://www.zohoapis.com/crm/v2/Deals?page=1&per_page=200'
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.data || !response.data.data) {
          console.log('No data in response:', response.data);
          continue;
        }

        return res.json({
          success: true,
          data: response.data
        });
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        lastError = error;
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All Zoho API endpoints failed');

  } catch (error) {
    console.error('Final error fetching deals:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
        error: error.response?.data?.message || "Authentication failed"
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Zoho CRM API endpoint not found",
        error: error.response?.data?.message || "API endpoint not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des deals",
      error: error.response?.data?.message || error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }
}; 