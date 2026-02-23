const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

const isJudge = (req, res, next) => {
  if (req.user?.role === 'judge' || req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Judge access required' });
};

module.exports = { isAdmin, isJudge };
