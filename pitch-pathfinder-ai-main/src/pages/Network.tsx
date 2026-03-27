const Network = () => {
  return (
    <div className="container px-4 py-10">
        <button
          style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      <h1 className="text-2xl font-bold mb-4">Player Network</h1>
      <p className="text-muted-foreground">Find and connect with players.</p>
    </div>
  );
};

export default Network;


