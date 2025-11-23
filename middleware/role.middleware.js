module.exports = (roles = []) => (req, res, next) => {
    if (!Array.isArray(roles)) roles = [roles];
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
  