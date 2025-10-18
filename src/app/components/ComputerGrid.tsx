// src/components/ComputerGrid.tsx
import ComputerCard, { type Computer } from './ComputerCard';
// import { useState } from 'react'; // 👈 ไม่จำเป็นต้องใช้ useState อีกต่อไป

interface ComputerGridProps {
  computers: Computer[];
  searchTerm: string; // 👈 1. รับ searchTerm มา
  onSearchChange: (value: string) => void; // 👈 2. รับฟังก์ชันสำหรับอัปเดต searchTerm
}

export default function ComputerGrid({ computers, searchTerm, onSearchChange }: ComputerGridProps) {
  // const [localSearchTerm, setLocalSearchTerm] = useState(''); // 👈 3. ลบ State นี้ออก

  // ฟังก์ชันนี้จะถูกเรียกเมื่อมีการกดปุ่ม
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ในวิธีนี้ เราไม่ได้ต้องการให้ Search ทำงานแค่ตอน Enter
    // เพราะ onSearchChange จะถูกเรียกทุกครั้งที่พิมพ์อยู่แล้ว
    // ถ้าคุณยังต้องการให้กด Enter เพื่อ trigger การ search เท่านั้น
    // คุณจะต้องเพิ่ม state เพิ่มเติมใน DashboardPage สำหรับ "committedSearchTerm"
    // แต่สำหรับตอนนี้ เราจะให้ Search ทำงานแบบ Real-time ตามที่คุณพิมพ์ครับ
    // ถ้าคุณอยากให้กด Enter เท่านั้น บอกได้นะครับ จะปรับ Logic ให้
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 md:gap-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Computers</h2>
        <div className="flex items-center w-full md:w-auto">
          <input
            type="search"
            placeholder="Search by name or OS..."
            value={searchTerm} // 👈 4. ผูกค่าเข้ากับ Prop `searchTerm`
            onChange={(e) => onSearchChange(e.target.value)} // 👈 5. เรียก onSearchChange ทันทีเมื่อพิมพ์
            onKeyDown={handleKeyDown} // 👈 6. onKeyDown ยังคงอยู่แต่ตอนนี้อาจจะไม่มีผลอะไร ถ้าต้องการแบบ Real-time
            className="mr-2 px-3 py-2 border rounded-md border-gray-600 bg-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
          />
          <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 whitespace-nowrap">
            Add New
          </button>
        </div>
      </div>
      
      {computers.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {searchTerm ? 'No computers found matching your search.' : 'No computers registered yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {computers.map((computer) => (
            <ComputerCard key={computer.id} computer={computer} />
          ))}
        </div>
      )}
    </div>
  );
}