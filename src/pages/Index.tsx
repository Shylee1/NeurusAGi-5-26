import { SEO } from '../components/SEO';

const Index = () => {
  return (
    <>
      <SEO
        title="NeurusAGi | Artificial General Intelligence Platform"
        description="NeurusAGi is an artificial general intelligence platform for reasoning, research, creative work, and task-oriented assistance."
        path="/"
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">NeurusAGi</h1>
          <p className="text-xl text-muted-foreground">Artificial general intelligence for reasoning, research, and creative work.</p>
        </div>
      </div>
    </>
  );
};

export default Index;
