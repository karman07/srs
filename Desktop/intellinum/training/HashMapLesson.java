import java.util.HashMap;

public class HashMapLesson {
    public static void main(String[] args) {
        HashMap<String, Integer> ages = new HashMap<>();
        ages.put("Karman", 21);
        ages.put("John", 25);

        System.out.println("Karman's age: " + ages.get("Karman"));
        for (String name : ages.keySet()) {
            System.out.println(name + " -> " + ages.get(name));
        }
    }
}
