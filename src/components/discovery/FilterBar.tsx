import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List, SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  activeView: 'card' | 'list';
  setActiveView: (view: 'card' | 'list') => void;
  activeSort: string;
  setActiveSort: (sort: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  availableTags: string[];
}

const FilterBar = ({
  activeView,
  setActiveView,
  activeSort,
  setActiveSort,
  selectedTags,
  onTagToggle,
  searchQuery,
  onSearchChange,
  availableTags
}: FilterBarProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search threads..." 
            className="pl-10 w-full"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <Select value={activeSort} onValueChange={setActiveSort}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="bookmarks">Most Bookmarked</SelectItem>
              <SelectItem value="reactions">Most Reactions</SelectItem>
            </SelectContent>
          </Select>
          
          {/* View Toggle */}
          <div className="flex rounded-md border border-input overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-none ${activeView === 'card' ? 'bg-secondary' : ''}`}
              onClick={() => setActiveView('card')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-none ${activeView === 'list' ? 'bg-secondary' : ''}`}
              onClick={() => setActiveView('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
          
          <Button variant="outline">
            Discover Something New
          </Button>
        </div>
      </div>
      
      {/* Tags Filter */}
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <Button 
            key={tag}
            variant={selectedTags.includes(tag) ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTagToggle(tag)}
            className="rounded-full"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
