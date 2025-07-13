import { useEffect, useState } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import './App.css';

const loadingMessages: string[] = [
  'Loading your cheese...',
  'Warming up the grill...',
  'Sharpening the knives...',
  'Slicing fresh veggies...',
  'Firing up the kitchen...',
  'Checking the tablecloth...',
  'Serving delicious code...',
  'Tuning the ambiance...',
  'Plating the perfection...',
  'Redirecting to flavor...'
];

const App: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [finalStatus, setFinalStatus] = useState<string>('');
  const [done, setDone] = useState<boolean>(false);

  useEffect(() => {
    // Simulate hardcoded URL parameters
    const restaurantName = 'Jatt Da Dhaba';
    const tableNumber = '5';

    console.log('🧭 Using params:', { restaurantName, tableNumber });

    const fetchDeployment = async () => {
      try {
        console.log('🌐 Fetching deployment info...');
        const response = await fetch(
          `http://localhost:3000/deployment?restaurantName=${encodeURIComponent(restaurantName)}`
        );

        console.log('✅ Response status:', response.status);
        if (!response.ok) throw new Error('API error');

        const deployment = await response.json();
        console.log('📦 Deployment data:', deployment);

        let redirectUrl = '';

        switch (deployment.selectedDeployment) {
          case 'Elegant Red':
            redirectUrl = deployment.deploymentLinkElegantRed;
            break;
          case 'Pretty Green':
            redirectUrl = deployment.deploymentLinkPrettyGreen;
            break;
          case 'Royal Gold':
            redirectUrl = deployment.deploymentLinkRoyalGold;
            break;
          default:
            throw new Error('Unknown deployment type');
        }

        const url = new URL(redirectUrl);
        url.searchParams.set('tableNumber', tableNumber);

        console.log('🚀 Redirecting to:', url.toString());

        setTimeout(() => {
          window.location.href = url.toString();
        }, 3000);
      } catch (error) {
        console.error('❌ Error during deployment fetch:', error);
        setDone(true);
        setFinalStatus('Something went wrong while fetching deployment info.');
      }
    };

    fetchDeployment();

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="content">
        <h1 className="heading">🍽️ Restaurant Redirect</h1>
        {!done ? (
          <p className="loading-text">
            <Typewriter
              words={[loadingMessages[currentMessageIndex]]}
              loop={0}
              typeSpeed={60}
              deleteSpeed={40}
              delaySpeed={1500}
            />
          </p>
        ) : (
          <p className="error-text">{finalStatus}</p>
        )}
      </div>
    </div>
  );
};

export default App;
