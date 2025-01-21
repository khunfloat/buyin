"use client";

import ImcLogo from "#/img/imclogo.svg";
import { Player, Transaction } from "@/interfaces/models";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferFrom, setTransferFrom] = useState<number | null>(null);
  const [showEndGamePopup, setShowEndGamePopup] = useState(false);
  const [finalChips, setFinalChips] = useState<{ [key: string]: number }>({});
  const [gameSummary, setGameSummary] = useState<
    { name: string; profitLoss: number }[]
  >([]);

  useEffect(() => {
    const storedPlayers = localStorage.getItem("players");
    const storedTransactions = localStorage.getItem("transactions");
    if (storedPlayers) setPlayers(JSON.parse(storedPlayers));
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
  }, []);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [players, transactions]);

  const handleAddMultiplePlayers = (formData: FormData) => {
    const names = (formData.get("names") as string)
      .split(/,|\n/)
      .map((name) => name.trim());
    const balance = parseFloat(formData.get("balance") as string);

    const updatedPlayers = [...players];

    names.forEach((name) => {
      const existingPlayerIndex = updatedPlayers.findIndex(
        (player) => player.name === name
      );

      if (existingPlayerIndex !== -1) {
        updatedPlayers[existingPlayerIndex].balance += balance;
      } else {
        updatedPlayers.push({ name, balance });
      }
    });

    setPlayers(updatedPlayers);
  };

  const handleTransfer = (formData: FormData) => {
    if (transferFrom !== null) {
      const toIndex = parseInt(formData.get("to") as string);
      const amount = parseFloat(formData.get("amount") as string);

      if (amount > 0) {
        const updatedPlayers = [...players];
        updatedPlayers[transferFrom].balance -= amount;
        updatedPlayers[toIndex].balance += amount;

        setTransactions([
          ...transactions,
          {
            from: players[transferFrom].name,
            to: players[toIndex].name,
            amount,
          },
        ]);

        setPlayers(updatedPlayers);
        setTransferFrom(null);
      }
    }
  };

  const handleEndGame = () => {
    const summary = players.map((player) => {
      const initialBalance = player.balance;
      const remainingChips = finalChips[player.name] || 0;
      const profitLoss = initialBalance - remainingChips;
      return { name: player.name, profitLoss };
    });

    setGameSummary(summary);
    setShowEndGamePopup(false);
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to start new game?")) {
      localStorage.removeItem("players");
      localStorage.removeItem("transactions");
      setPlayers([]);
      setTransactions([]);
    }
  };

  const handleFinalChipChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    playerName: string
  ) => {
    const value = parseFloat(e.target.value);
    setFinalChips((prev) => ({
      ...prev,
      [playerName]: value,
    }));
  };

  const totalActiveChips = players.reduce(
    (sum, player) => sum + player.balance,
    0
  );

  return (
    <div className="text-white pt-10 px-3 pb-10">
      <div className="flex justify-center pb-2">
        <Image
          src={ImcLogo}
          width={80}
          height={80}
          alt="Picture of the author"
        />
      </div>
      <div className="text-center text-3xl font-bold">Intania Music Casino</div>
      <div className="text-center pb-5 text-lg">BuyIn Manager</div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowEndGamePopup(true)}
          className="px-4 py-2 bg-red-500 text-white rounded text-sm"
        >
          End Game
        </button>
      </div>

      <div className="font-semibold text-2xl pt-4">
        Active Chip: {totalActiveChips}
      </div>

      <div className="my-4">
        <p className="pb-1 font-semibold">Add Players</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAddMultiplePlayers(formData);
            e.currentTarget.reset();
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            name="names"
            className="text-black px-2 py-1 rounded border"
            placeholder="Enter player names (comma-separated or new lines)"
            rows={3}
            required
          />
          <input
            name="balance"
            className="text-black px-2 py-1 rounded border"
            placeholder="Enter buy in amount"
            type="number"
            required
            min={0}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            Add Players
          </button>
        </form>
      </div>

      <div>
        <p className="font-semibold">Players Stat</p>
        <ul className="list-disc">
          {players.map((player, index) => (
            <li
              key={index}
              className="mt-1 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 pl-5 py-1 rounded-sm"
            >
              {player.name} - BuyIn: {player.balance}
              {player.balance < 0 && (
                <span className="text-green-500"> (Profit)</span>
              )}
              <button
                onClick={() => setTransferFrom(index)}
                className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
              >
                Transfer To
              </button>
            </li>
          ))}
        </ul>
      </div>

      {transferFrom !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded text-black">
            <h3 className="font-bold text-lg mb-4">
              Transfer from {players[transferFrom].name}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleTransfer(formData);
                e.currentTarget.reset();
              }}
              className="flex flex-col gap-2"
            >
              <select
                name="to"
                className="w-full px-2 py-1 border rounded"
                required
              >
                <option value="" disabled>
                  Select player to transfer to
                </option>
                {players.map((player, index) =>
                  index !== transferFrom ? (
                    <option key={index} value={index}>
                      {player.name}
                    </option>
                  ) : null
                )}
              </select>
              <input
                name="amount"
                className="w-full px-2 py-1 border rounded"
                type="number"
                placeholder="Enter amount"
                required
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setTransferFrom(null)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="font-semibold">Transaction History</p>
        <ul className="list-disc pl-5">
          {transactions.map((transaction, index) => (
            <li key={index} className="mt-1">
              {transaction.from} transferred {transaction.amount} to{" "}
              {transaction.to}
            </li>
          ))}
        </ul>
      </div>

      {showEndGamePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          {/* Popup content */}
          <div className="bg-white p-5 rounded text-black max-h-[80vh] overflow-y-auto">
            {/* Confirmation header */}
            <h3 className="font-bold text-lg mb-4">
              Are you sure you want to end the game?
            </h3>

            {/* Final chips input form */}
            <h3 className="font-bold text-lg mb-4">Enter Final Chips</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEndGame();
              }}
              className="flex flex-col gap-2"
            >
              {players.map((player, index) => (
                <div key={index} className="mb-3">
                  <label className="font-semibold">
                    {player.name} - Final Chips
                  </label>
                  <input
                    type="number"
                    value={
                      finalChips[player.name] !== undefined
                        ? finalChips[player.name]
                        : 0
                    }
                    onChange={(e) => handleFinalChipChange(e, player.name)}
                    className="w-full px-2 py-1 border rounded"
                    required
                  />
                </div>
              ))}

              {/* Action buttons */}
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowEndGamePopup(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {gameSummary.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-lg">Game Summary</h3>
          <ul className="mt-2">
            {gameSummary.map((entry, index) => (
              <li
                key={index}
                className={`p-2 mb-1 rounded text-white ${
                  entry.profitLoss > 0 ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {entry.profitLoss > 0 ? (
                  <span>
                    {entry.name} Loss: {entry.profitLoss}
                  </span>
                ) : (
                  <span>
                    {entry.name} Profit: {-entry.profitLoss}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={handleClearData}
          className="text-red-500 rounded underline"
        >
          New Game
        </button>
      </div>
    </div>
  );
}