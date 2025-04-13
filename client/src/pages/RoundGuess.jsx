import { useParams } from 'react-router';
import { CountdownProgressBar } from '../components/CountdownProgressBar/CountdownProgressBar';
import { VotingSection } from '../components/VotingSection/VotingSection';

export const RoundGuess = () => {
  const { sessionID, roundID } = useParams();
  const handleTimeExpiration = () => {
    console.log('TIMES UP!')
  }

  return (
    <div>
      <iframe 
        style={{borderRadius: '12px'}} 
        src="https://open.spotify.com/embed/track/2TjngvHoJQIkI7BGoK04D2?theme=0" 
        width="100%" height="352" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"></iframe>

      <CountdownProgressBar duration={60} onComplete={handleTimeExpiration} />
      <VotingSection />
    </div>
  )
}