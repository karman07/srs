import java.util.ArrayList;

public class ArrayListLesson {
    public static void main(String[] args) {
        ArrayList<String> cars = new ArrayList<>();
        cars.add("BMW");
        cars.add("Tesla");
        cars.add("Audi");

        cars.remove("BMW");
        System.out.println("Cars: " + cars);
        System.out.println("First car: " + cars.get(0));
    }
}
