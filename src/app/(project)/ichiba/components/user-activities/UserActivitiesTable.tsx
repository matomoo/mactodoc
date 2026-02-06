"use client";
// biome-ignore assist/source/organizeImports: <none>
import { useState, useMemo } from "react";

import { useRouter } from "next/navigation";

import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, CheckCircle, Edit, Eye, FileText, Filter, Loader2, PlusCircle, Trash2, User } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useDeleteUserActivity, useUserActivities } from "../../hooks/useUserActivities";
import type { UserActivities } from "../../types";

interface TimelineActivity {
  user_email: string;
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_display: string;
  details: string;
  parsed_details?: {
    action: string;
    entity: string;
    timestamp: string;
    newData: Record<string, any>;
    previousData?: Record<string, any>;
  };
  created_at: string;
  formatted_date: string;
  formatted_time: string;
  icon: string;
  color: string;
}

export function UserActivitiesTable() {
  const { data: userActivities = [], isLoading, refetch } = useUserActivities();
  // const { data: users = [] } = useUsers(); // You'll need to create this hook
  const { mutate: deleteUserActivity } = useDeleteUserActivity({
    onSuccess: () => {
      refetch();
    },
  });

  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userActivityToDelete, setUserActivityToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const parseActivityDetails = useMemo(() => {
    return (activity: any): TimelineActivity => {
      try {
        // Parse the details JSON
        let detailsString = activity.details;
        if (detailsString?.startsWith('"') && detailsString?.endsWith('"')) {
          detailsString = detailsString.slice(1, -1);
        }

        const parsedDetails = detailsString ? JSON.parse(detailsString) : {};
        const date = parseISO(activity.created_at);

        // Get user name
        const userName = activity.user?.full_name || activity.user?.name || `User ${activity.user_id?.slice(0, 8)}...`;

        // Get entity display name
        let entityDisplay = activity.entity_id;
        if (parsedDetails.newData?.display_name) {
          entityDisplay = parsedDetails.newData.display_name;
        } else if (parsedDetails.newData?.customer_name) {
          entityDisplay = `Visit for ${parsedDetails.newData.customer_name}`;
        } else if (parsedDetails.newData?.name) {
          entityDisplay = parsedDetails.newData.name;
        }

        // Determine icon and color based on action
        const getActionConfig = (action: string) => {
          switch (action.toUpperCase()) {
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
          user_name: userName,
          entity_display: entityDisplay,
          parsed_details: parsedDetails,
          formatted_date: format(date, "dd MMMM yyyy", { locale: id }),
          formatted_time: format(date, "HH:mm:ss"),
          icon: config.icon,
          color: config.color,
        };
      } catch (error) {
        console.error("Error parsing activity:", error);
        const date = parseISO(activity.created_at);
        const userName = activity.user?.full_name || activity.user?.name || `User ${activity.user_id?.slice(0, 8)}...`;

        return {
          ...activity,
          user_name: userName,
          entity_display: activity.entity_id,
          formatted_date: format(date, "dd MMMM yyyy", { locale: id }),
          formatted_time: format(date, "HH:mm:ss"),
          icon: "circle",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
      }
    };
  }, []);

  // Calculate filtered activities with useMemo to prevent unnecessary recalculations
  const filteredActivities = useMemo(() => {
    // Parse all activities first
    const parsedActivities = userActivities.map(parseActivityDetails);

    let activities = parsedActivities;

    // Filter by user
    if (selectedUser !== "all") {
      activities = activities.filter((activity) => activity.user_id === selectedUser);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      activities = activities.filter(
        (activity) =>
          activity.user_name.toLowerCase().includes(query) ||
          activity.entity_type.toLowerCase().includes(query) ||
          (activity.entity_display && activity.entity_display.toLowerCase().includes(query)) ||
          activity.action.toLowerCase().includes(query),
      );
    }

    // Sort by date (newest first)
    return [...activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [userActivities, selectedUser, searchQuery, parseActivityDetails]);

  const uniqueUsers = useMemo(() => {
    return filteredActivities.reduce(
      (acc, activity) => {
        if (activity.user_id && !acc.some((u) => u.id === activity.user_id)) {
          acc.push({
            id: activity.user_id,
            name: activity.user_name,
            email: activity.user_email || "",
          });
        }
        return acc;
      },
      [] as Array<{ id: string; name: string; email: string }>,
    );
  }, [filteredActivities]);

  // Filter activities by selected user

  const confirmDelete = () => {
    if (userActivityToDelete) {
      deleteUserActivity(userActivityToDelete);
      setDeleteDialogOpen(false);
      setUserActivityToDelete(null);
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return <PlusCircle className="w-4 h-4" />;
      case "UPDATE":
        return <Edit className="w-4 h-4" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4" />;
      case "VIEW":
        return <Eye className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Get unique users from activities
  // Get unique users from activities directly
  // const uniqueUsers = filteredActivities.reduce(
  //   (acc, activity) => {
  //     if (!acc.some((u) => u.id === activity.user_id)) {
  //       acc.push({
  //         id: activity.user_id,
  //         name: activity.user_name,
  //         email: activity.user_email || "",
  //       });
  //     }
  //     return acc;
  //   },
  //   [] as Array<{ id: string; name: string; email: string }>,
  // );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Timeline</h1>
          <p className="text-gray-600 mt-1">Monitor all user activities across the system</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filters</span>
              </div>

              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Activities</p>
                <p className="text-2xl font-bold">{filteredActivities.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Create Actions</p>
                <p className="text-2xl font-bold">{filteredActivities.filter((a) => a.action === "CREATE").length}</p>
              </div>
              <PlusCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Update Actions</p>
                <p className="text-2xl font-bold">{filteredActivities.filter((a) => a.action === "UPDATE").length}</p>
              </div>
              <Edit className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">{new Set(filteredActivities.map((a) => a.user_id)).size}</p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Activity Timeline</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedUser === "all" ? "Showing all user activities" : `Showing activities for selected user`}
                </p>
              </div>
              <div className="text-sm text-gray-500">{filteredActivities.length} activities found</div>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-500">
                {selectedUser === "all"
                  ? "There are no activities in the system yet."
                  : "No activities found for this user. Try selecting a different user or remove filters."}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-6">
                {filteredActivities.map((activity, index) => (
                  <div key={activity.id} className="relative">
                    {/* Timeline line */}
                    {index !== filteredActivities.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                    )}

                    <div className="flex">
                      {/* Icon/Date */}
                      <div className="flex-shrink-0">
                        <div
                          className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center ${activity.color}`}
                        >
                          {getActionIcon(activity.action)}
                        </div>
                        {/* <div className="text-xs text-gray-500 text-center mt-2">
                          {activity.formatted_time}
                        </div> */}
                      </div>

                      {/* Content */}
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-gray-700">
                                  {activity.user_name}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                  {activity.entity_type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1 truncate">
                                <span>{activity.action}</span>
                                <span> </span>
                                <span>{activity.entity_id}</span>
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>{activity.formatted_date}</span>
                                <span>•</span>
                                <span>{activity.formatted_time}</span>
                              </div>
                            </div>

                            {/* <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedActivity(
                                  expandedActivity === activity.id ? null : activity.id
                                )}
                              >
                                {expandedActivity === activity.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/ichiba/app/user-activities/${activity.id}`)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(activity.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div> */}
                          </div>

                          {/* Expanded Details */}
                          {/* {expandedActivity === activity.id && activity.parsed_details && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                                  <div className="bg-white border rounded p-3">
                                    <pre className="text-xs whitespace-pre-wrap break-words overflow-auto max-h-60">
                                      {JSON.stringify(activity.parsed_details.newData, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                {activity.parsed_details.previousData && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Previous State</h4>
                                    <div className="bg-white border rounded p-3">
                                      <pre className="text-xs whitespace-pre-wrap break-words overflow-auto max-h-60">
                                        {JSON.stringify(activity.parsed_details.previousData, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {!activity.parsed_details.previousData && (
                                <div className="mt-2 text-xs text-gray-500">
                                  No previous state available for this activity
                                </div>
                              )}
                            </div>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserActivityToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
