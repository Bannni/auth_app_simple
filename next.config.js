// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        // Sumber URL yang ingin di-redirect
        destination: '/login', // Tujuan URL setelah di-redirect
        permanent: false, // Pilih false untuk redireksi sementara
      },
    ];
  },
};