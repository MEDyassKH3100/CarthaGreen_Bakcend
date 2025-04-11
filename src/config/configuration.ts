export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/carthagreen',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || '',
  },
  otp: {
    expiration: parseInt(process.env.OTP_EXPIRATION || '10', 10), // minutes
  },
});