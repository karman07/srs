public class TypeCastingLesson {
    public static void main(String[] args) {
        int num = 10;
        double converted = num; // implicit casting (int → double)
        System.out.println("Implicit: " + converted);

        double value = 9.78;
        int casted = (int) value; // explicit casting (double → int)
        System.out.println("Explicit: " + casted);
    }
}
