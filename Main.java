import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.PriorityQueue;

public class Main {

    public static int numOfUnplacedFruits(int[] fruits, int[] baskets) {
        int ans = 0;
        Arrays.sort(fruits);
        int n = fruits.length;

        int j = 0;
        for(int i=0; i<n && j<n; i++) {
            int fruit = fruits[i];
            while(j<n && baskets[j] < fruit) {
                j++;
            }
            if(j == n) break;
            baskets[j] = 0;
            j++;
        }

        for(int i=0; i<n; i++) {
            if(baskets[i] != 0) {
                ans++;
            }
        }

        return ans;
    }

    public static long[] findMaxSum(int[] nums1, int[] nums2, int k) {
        int n = nums1.length;
        long[] ans = new long[n];

        int[][] map = new int[n][2];
        for(int i=0; i<n; i++) {
            map[i][0] = nums1[i];
            map[i][1] = i;
        }
        Arrays.sort(map, Comparator.comparingDouble((o) -> o[0]));
        long[] prefix = new long[n];

        PriorityQueue<Long> pq = new PriorityQueue<>();
        int l = 0;
        long sum = 0;
        for(int i=0; i<n; i++) {
            int j=i-1;
            int val = 0;
            if(j >= 0) {
                int idx = map[j][1];
                val = nums2[idx];
                pq.add((long)val);
                sum += val;
                l++;
                if(l > k) {
                    sum -= pq.remove();
                    l--;
                }
            }

            prefix[i] = sum;
        }

        for(int i=0; i<n; i++) {
            int idx = map[i][1];
            ans[idx] = prefix[i];
            long val = ans[idx];
            while(i<n-1 && map[i][0] == map[i+1][0]) {
                idx = map[i+1][1];
                ans[idx] = val;
                i++;
            }
        }

        return ans;
    }

    public static void main(String[] args) {
        int[] fruits = {3, 6, 1};
        int[] baskets = {6, 4, 7};
        System.out.println(numOfUnplacedFruits(fruits, baskets));
        // int[] nums1 = {4, 2, 1, 5, 3};
        // int[] nums2 = {10, 20, 30, 40, 50};
        // int k=1;
        // long[] ans = findMaxSum(nums1, nums2, k);
        // for(long i: ans) {
        //     System.out.print(i+" ");
        // }
    } 
}