import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Star, 
  Eye, 
  Clock,
  MapPin,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";

interface AnalyticsDashboardProps {
  user?: any;
  data?: any;
}

const AnalyticsDashboard = ({ user, data }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(false);

  // Mock analytics data
  const mockData = {
    overview: {
      totalRevenue: 125000,
      totalBookings: 342,
      averageRating: 4.8,
      occupancyRate: 78,
      growthRate: 12.5,
      monthlyGrowth: 8.2
    },
    revenue: {
      current: 125000,
      previous: 110000,
      growth: 13.6,
      monthly: [8500, 9200, 7800, 10500, 11200, 9800, 12500, 11800, 13200, 14100, 13800, 12500],
      categories: [
        { name: "Photography", value: 45000, percentage: 36 },
        { name: "Music Recording", value: 32000, percentage: 25.6 },
        { name: "Video Production", value: 28000, percentage: 22.4 },
        { name: "Podcast", value: 15000, percentage: 12 },
        { name: "Other", value: 5000, percentage: 4 }
      ]
    },
    bookings: {
      total: 342,
      confirmed: 298,
      pending: 28,
      cancelled: 16,
      monthly: [25, 32, 28, 35, 42, 38, 45, 41, 48, 52, 49, 45],
      byStudio: [
        { name: "Professional Photography Studio", bookings: 89, revenue: 35600 },
        { name: "Music Recording Studio", bookings: 67, revenue: 26800 },
        { name: "Video Production Studio", bookings: 54, revenue: 21600 },
        { name: "Podcast Studio", bookings: 45, revenue: 18000 },
        { name: "Event Space", bookings: 32, revenue: 12800 }
      ]
    },
    performance: {
      responseTime: "1.2 hours",
      responseRate: 98.5,
      guestSatisfaction: 4.8,
      repeatBookings: 45,
      averageBookingValue: 365,
      peakHours: ["14:00", "16:00", "18:00"],
      popularDays: ["Friday", "Saturday", "Sunday"]
    },
    insights: [
      {
        type: "positive",
        title: "Revenue Growth",
        description: "Your revenue increased by 13.6% this month",
        value: "+13.6%",
        icon: TrendingUp
      },
      {
        type: "positive",
        title: "High Occupancy",
        description: "Your studios are 78% occupied on average",
        value: "78%",
        icon: Users
      },
      {
        type: "warning",
        title: "Response Time",
        description: "Consider improving response time for better ratings",
        value: "1.2h",
        icon: Clock
      },
      {
        type: "positive",
        title: "Guest Satisfaction",
        description: "Excellent guest satisfaction score",
        value: "4.8/5",
        icon: Star
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number) => {
    return value > 0 ? ArrowUp : ArrowDown;
  };

  const generateChartData = (data: number[], labels: string[]) => {
    return {
      labels,
      datasets: [{
        label: 'Revenue',
        data,
        borderColor: '#FF385C',
        backgroundColor: 'rgba(255, 56, 92, 0.1)',
        tension: 0.4
      }]
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Analytics Dashboard</h1>
          <p className="text-neutral-600">Track your studio performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(mockData.overview.totalRevenue)}</p>
            </div>
            <div className={`flex items-center gap-1 ${getGrowthColor(mockData.overview.growthRate)}`}>
              {React.createElement(getGrowthIcon(mockData.overview.growthRate), { className: "w-4 h-4" })}
              <span className="text-sm font-medium">{formatPercentage(mockData.overview.growthRate)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-neutral-600">vs last period</span>
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">{mockData.overview.totalBookings}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-neutral-600">vs last period</span>
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Average Rating</p>
              <p className="text-2xl font-bold text-neutral-900">{mockData.overview.averageRating}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">+0.2</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-neutral-600">out of 5 stars</span>
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{mockData.overview.occupancyRate}%</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5.2%</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-neutral-600">studio utilization</span>
          </div>
        </AirbnbCard>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AirbnbCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900">Revenue Trend</h3>
                  <Badge variant="secondary">Monthly</Badge>
                </div>
                <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                    <p className="text-neutral-600">Revenue chart would be displayed here</p>
                    <p className="text-sm text-neutral-500">Chart.js or Recharts integration</p>
                  </div>
                </div>
              </AirbnbCard>
            </div>

            <div>
              <AirbnbCard className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue by Category</h3>
                <div className="space-y-4">
                  {mockData.revenue.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-purple-500' : 
                          index === 2 ? 'bg-green-500' : 
                          index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-neutral-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">{formatCurrency(category.value)}</p>
                        <p className="text-xs text-neutral-600">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AirbnbCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Booking Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-neutral-900">Confirmed</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{mockData.bookings.confirmed}</p>
                    <p className="text-sm text-neutral-600">87%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-neutral-900">Pending</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{mockData.bookings.pending}</p>
                    <p className="text-sm text-neutral-600">8%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-neutral-900">Cancelled</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{mockData.bookings.cancelled}</p>
                    <p className="text-sm text-neutral-600">5%</p>
                  </div>
                </div>
              </div>
            </AirbnbCard>

            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Performing Studios</h3>
              <div className="space-y-4">
                {mockData.bookings.byStudio.map((studio, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">{studio.name}</p>
                      <p className="text-sm text-neutral-600">{studio.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">{formatCurrency(studio.revenue)}</p>
                      <p className="text-xs text-neutral-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </AirbnbCard>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Response Time</span>
                  <span className="font-semibold text-neutral-900">{mockData.performance.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Response Rate</span>
                  <span className="font-semibold text-neutral-900">{mockData.performance.responseRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Guest Satisfaction</span>
                  <span className="font-semibold text-neutral-900">{mockData.performance.guestSatisfaction}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Repeat Bookings</span>
                  <span className="font-semibold text-neutral-900">{mockData.performance.repeatBookings}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Average Booking Value</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(mockData.performance.averageBookingValue)}</span>
                </div>
              </div>
            </AirbnbCard>

            <AirbnbCard className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Peak Hours & Days</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Peak Hours</h4>
                  <div className="flex gap-2">
                    {mockData.performance.peakHours.map((hour, index) => (
                      <Badge key={index} variant="secondary">{hour}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Popular Days</h4>
                  <div className="flex gap-2">
                    {mockData.performance.popularDays.map((day, index) => (
                      <Badge key={index} variant="secondary">{day}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AirbnbCard>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockData.insights.map((insight, index) => (
              <AirbnbCard key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    insight.type === 'positive' ? 'bg-green-100' : 
                    insight.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <insight.icon className={`w-6 h-6 ${
                      insight.type === 'positive' ? 'text-green-600' : 
                      insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">{insight.title}</h4>
                      <span className={`text-sm font-medium ${
                        insight.type === 'positive' ? 'text-green-600' : 
                        insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{insight.value}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{insight.description}</p>
                  </div>
                </div>
              </AirbnbCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 