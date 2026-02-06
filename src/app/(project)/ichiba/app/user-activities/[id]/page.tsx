// app/activities/timeline/page.tsx
"use client";

import { useEffect, useState } from "react";

import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  PlusCircle,
  Trash2,
  User,
} from "lucide-react";

import type { ParsedActivity, UserActivities } from "../../../types";

// Mock data - replace with your actual API call
const mockActivities: UserActivities[] = [
  {
    id: "14db0b80-c5ff-4670-ac2c-122418a9e4b6",
    user_id: "4bbb2ede-9894-466c-bfd3-e08c1f24cef7",
    action: "CREATE",
    entity_type: "medical_devices",
    entity_id: "d41fa1c5-5c57-4ddf-9643-68d844260564",
    details:
      '{"action":"CREATE","entity":"medical_devices","timestamp":"2026-02-05T07:10:44.554Z","newData":{"id":"d41fa1c5-5c57-4ddf-9643-68d844260564","name":"asd","description":"asd","merk":"asd","type":"asd","series":"asd","test_types_id":"0d60a080-85d5-4493-be13-05c0bde114df"}}',
    created_at: "2026-02-05 07:10:43.145471+00",
  },
];

export default function ActivityTimelinePage() {
  const [activities, setActivities] = useState<ParsedActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ParsedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "all",
    entity_type: "all",
    date_range: "all",
  });

  // Fetch activities from API
  useEffect(() => {
    // Parse activity data
    const parseActivity = (activity: UserActivities): ParsedActivity => {
      try {
        // Clean up the details string if it has extra quotes
        let detailsString = activity.details;
        if (detailsString.startsWith('"') && detailsString.endsWith('"')) {
          detailsString = detailsString.slice(1, -1);
        }

        const parsedDetails = JSON.parse(detailsString);
        const date = parseISO(activity.created_at || new Date().toISOString());

        // Determine icon and color based on action
        const getActionConfig = (action: string) => {
          switch (action) {
            case "CREATE":
              return { icon: "plus", color: "bg-green-100 text-green-800 border-green-200" };
            case "UPDATE":
              return { icon: "edit", color: "bg-blue-100 text-blue-800 border-blue-200" };
            case "DELETE":
              return { icon: "trash", color: "bg-red-100 text-red-800 border-red-200" };
            case "VIEW":
              return { icon: "eye", color: "bg-purple-100 text-purple-800 border-purple-200" };
            default:
              return { icon: "circle", color: "bg-gray-100 text-gray-800 border-gray-200" };
          }
        };

        const config = getActionConfig(activity.action);

        return {
          ...activity,
          parsed_details: parsedDetails,
          formatted_date: format(date, "MMMM dd, yyyy"),
          formatted_time: format(date, "HH:mm:ss"),
          icon: config.icon,
          color: config.color,
        };
      } catch (error) {
        console.error("Error parsing activity:", error);
        // Return a fallback parsed activity
        const date = parseISO(activity.created_at || new Date().toISOString());
        return {
          ...activity,
          parsed_details: {
            action: activity.action,
            entity: activity.entity_type,
            timestamp: activity.created_at || new Date().toISOString(),
            newData: {},
          },
          formatted_date: format(date, "MMMM dd, yyyy"),
          formatted_time: format(date, "HH:mm:ss"),
          icon: "circle",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
      }
    };

    const fetchActivities = async () => {
      try {
        // Replace with your actual API endpoint
        // const response = await fetch('/api/activities');
        // const data = await response.json();

        // For now, use mock data
        const parsed = mockActivities.map(parseActivity);
        setActivities(parsed);
        setFilteredActivities(parsed);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities
  useEffect(() => {
    let filtered = activities;

    if (filters.action !== "all") {
      filtered = filtered.filter((activity) => activity.action === filters.action);
    }

    if (filters.entity_type !== "all") {
      filtered = filtered.filter((activity) => activity.entity_type === filters.entity_type);
    }

    setFilteredActivities(filtered);
  }, [filters, activities]);

  // Get icon component
  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <PlusCircle className="w-5 h-5" />;
      case "UPDATE":
        return <Edit className="w-5 h-5" />;
      case "DELETE":
        return <Trash2 className="w-5 h-5" />;
      case "VIEW":
        return <Eye className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Activity Timeline</h1>
          <p className="text-gray-600 mt-2">Track all user activities and system events</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">Action Type</div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
              </select>
            </div>
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">Entity Type</div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.entity_type}
                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
              >
                <option value="all">All Entities</option>
                <option value="medical_devices">Medical Devices</option>
                <option value="users">Users</option>
                <option value="test_types">Test Types</option>
              </select>
            </div>
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">Date Range</div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.date_range}
                onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Create Actions</p>
                <p className="text-2xl font-bold">{activities.filter((a) => a.action === "CREATE").length}</p>
              </div>
              <PlusCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Update Actions</p>
                <p className="text-2xl font-bold">{activities.filter((a) => a.action === "UPDATE").length}</p>
              </div>
              <Edit className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unique Users</p>
                <p className="text-2xl font-bold">{new Set(activities.map((a) => a.user_id)).size}</p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing {filteredActivities.length} of {activities.length} activities
            </p>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-8">
                {filteredActivities.map((activity, index) => (
                  <div key={activity.id} className="relative">
                    {/* Timeline line */}
                    {index !== filteredActivities.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                    )}

                    <div className="flex">
                      {/* Icon */}
                      <div
                        className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${activity.color}`}
                      >
                        {getActionIcon(activity.action)}
                      </div>

                      {/* Content */}
                      <div className="ml-6 flex-1">
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                <span className="capitalize">{activity.action.toLowerCase()}</span>{" "}
                                {activity.entity_type.replace("_", " ")}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Entity ID: <span className="font-mono text-xs">{activity.entity_id}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                <span>{activity.formatted_date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{activity.formatted_time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">New Data</h4>
                              <div className="bg-white border rounded-md p-3">
                                <pre className="text-xs whitespace-pre-wrap break-words">
                                  {JSON.stringify(activity.parsed_details.newData, null, 2)}
                                </pre>
                              </div>
                            </div>

                            {activity.parsed_details.previousData && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Data</h4>
                                <div className="bg-white border rounded-md p-3">
                                  <pre className="text-xs whitespace-pre-wrap break-words">
                                    {JSON.stringify(activity.parsed_details.previousData, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>User: {activity.user_id.slice(0, 8)}...</span>
                              </div>
                              <div>
                                <span className="font-medium">Activity ID:</span> {activity.id}
                              </div>
                              <div>
                                <span className="font-medium">Index:</span> {activity.id}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination or Load More */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Load More Activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
