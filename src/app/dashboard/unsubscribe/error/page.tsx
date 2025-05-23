export default function UnsubscribeError() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-center px-6">
      <div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Errore</h1>
        <p className="text-gray-700 text-lg">
          Il link per annullare l'iscrizione non è valido o è già stato usato.
        </p>
        <p className="text-gray-500 mt-2 text-sm">
          Se hai bisogno di aiuto, scrivici a support@maturamate.it
        </p>
      </div>
    </main>
  );
}
