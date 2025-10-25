import ComputerCard, { type Computer } from './ComputerCard';
import Pagination from './Pagination';
import { useMemo } from 'react';

interface ComputerGridProps {
  computers: Computer[];
  searchTerm: string;
  onSearchChange: (value: string) => void; 
  onComputerDeleted?: (computerId: string) => void;
  onComputerRenamed?: (computerId: string, newName: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ITEMS_PER_PAGE = 16;

export default function ComputerGrid({ 
  computers, 
  searchTerm, 
  onSearchChange, 
  onComputerDeleted, 
  onComputerRenamed,
  currentPage,
  onPageChange
}: ComputerGridProps) {

  // Calculate pagination
  const totalPages = Math.ceil(computers.length / ITEMS_PER_PAGE);
  const paginatedComputers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return computers.slice(startIndex, endIndex);
  }, [computers, currentPage]);

  const handleKeyDown = () => {}; // FIX: remove unused param to satisfy @typescript-eslint/no-unused-vars

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 md:gap-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Computers</h2>
        <div className="flex items-center w-full md:w-auto">
          <input
            type="search"
            placeholder="Search by name or OS..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1); // Reset to page 1 when searching
            }}
            onKeyDown={handleKeyDown}
            className="mr-2 px-3 py-2 border rounded-md border-gray-600 bg-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
          />
          {/* <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 whitespace-nowrap">
            Add New
          </button> */}
          <a
            href="/downloads/EasierBackup.zip"
            download
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 whitespace-nowrap"
          >
            Add New
          </a>
        </div>
      </div>
      
      {computers.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {searchTerm ? 'No computers found matching your search.' : 'No computers registered yet.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedComputers.map((computer) => (
              <ComputerCard 
                key={computer.id} 
                computer={computer}
                onDelete={onComputerDeleted}
                onRename={onComputerRenamed}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={computers.length}
          />
        </>
      )}
    </div>
  );
}