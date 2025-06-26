"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

type Car = {
  id: string;
  name: string;
  year: number;
  price: number;
};

export function SearchComponent() {
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [is005Loading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Car[] | { error?: string } | null
  >(null);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      console.log("API response data:", data); // <-- Debug log
      if (!response.ok || data.error) {
        setSearchResults({ error: data.error || "Car not found" });
      } else {
        const cars = Array.isArray(data) ? data : [data];
        setSearchResults(cars);
      }
    } catch (error) {
      if(error) setSearchResults({ error: "Failed to search. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter cars by price range if selected
  const filteredCars: Car[] = (() => {
    if (!searchResults) return [];
    if ("error" in searchResults) return [];
    const cars = Array.isArray(searchResults) ? searchResults : [searchResults as Car];
    if (!priceRange) return cars;

    const [min, maxStr] = priceRange.split("-");
    const minPrice = Number(min);
    const maxPrice = maxStr === "+" ? Infinity : Number(maxStr);

    const filtered = cars.filter((car) => {
      if (maxPrice === Infinity) {
        return car.price >= minPrice;
      } else {
        return car.price >= minPrice && car.price <= maxPrice;
      }
    });

    console.log("priceRange:", priceRange); // <-- Debug log
    console.log("cars before filter:", cars); // <-- Debug log
    console.log("filteredCars:", filtered); // <-- Debug log

    return filtered;
  })();

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-lg p-4 max-w-4xl mx-auto shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Input
          placeholder="Search by make, model, or natural language..."
          className="md:col-span-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-10000">$0 - $10,000</SelectItem>
            <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
            <SelectItem value="20000-30000">$20,000 - $30,000</SelectItem>
            <SelectItem value="30000+">$30,000+</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={is005Loading} className="w-full">
          <Search className="mr-2 h-4 w-4" />
          {is005Loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <div className="mt-2 flex justify-end">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={true}
            onChange={() => {}}
            className="h-4 w-4"
          />
          Use AI Search
        </label>
      </div>
      {/* Show search results */}
      {searchResults && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-bold mb-2">Search Results</h3>
          {"error" in searchResults ? (
            <p className="text-red-500">{searchResults.error}</p>
          ) : filteredCars.length > 0 ? (
            <div className="space-y-4">
              {filteredCars.map((car) => (
                <div key={car.id} className="border-b pb-4 last:border-b-0">
                  <p className="text-lg font-semibold">{car.name}</p>
                  <p>Year: {car.year}</p>
                  <p>Price: ${car.price?.toLocaleString()}</p>
                  <div className="flex gap-2 mt-2">
                    <Button asChild>
                      <Link href={`/cars/${car.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
