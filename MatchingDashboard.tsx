const handleGigSelect = async (gig: Gig) => {
  try {
    setLoading(true);
    setSelectedGig(gig);
    if (gig?.id) {
      const matches = await findMatchesForGig(gig.id);
      setMatchingReps(matches);
    }
  } catch (error) {
    console.error('Error finding matches:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (selectedGig) {
    console.log('Running matching calculation for gig:', selectedGig);
    // Log les données importantes utilisées dans le calcul
    console.log('Available reps:', reps);
    console.log('Current weights:', weights);
    // ... votre logique de matching ...
  }
}, [selectedGig, reps, weights]); 