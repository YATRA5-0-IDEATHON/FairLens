const MOCK_COMPANY_DB = [
  { code: 'COMP-101', name: 'Acme Global Corp', password: 'admin123', role: 'HR_ADMIN' },
  { code: 'COMP-777', name: 'FairLens Tech Inc', password: 'fairlens2026', role: 'HR_ADMIN' },
  { code: 'EQUI-999', name: 'Nexus Innovations', password: 'equi2026', role: 'HR_ADMIN' }
];

exports.companyLogin = async (req, res) => {
  try {
    const { companyCode, password } = req.body;

    if (!companyCode || !password) {
      return res.status(400).json({ error: 'companyCode and password are required' });
    }

    const company = MOCK_COMPANY_DB.find(
      c => c.code.toUpperCase() === companyCode.trim().toUpperCase() && c.password === password
    );

    if (!company) {
      return res.status(401).json({ error: 'Invalid Company Code or Password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Company authentication successful',
      token: `mock-jwt-token-${Date.now()}`,
      company: {
        code: company.code,
        name: company.name,
        role: company.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.employeeLogin = async (req, res) => {
  try {
    const { employeeId } = req.body;
    return res.status(200).json({
      success: true,
      message: 'Anonymous employee access granted',
      token: `anon-token-${Date.now()}`,
      anonymousId: employeeId || `ANON-${Math.floor(1000 + Math.random() * 9000)}`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
